import ast
import base64
import json
import math
import os
import struct
import sys
from array import array

import torch
import torch.nn as nn


LABELS = [
    "lvef_lte_45_flag",
    "lvwt_gte_13_flag",
    "aortic_stenosis_moderate_or_greater_flag",
    "aortic_regurgitation_moderate_or_greater_flag",
    "mitral_regurgitation_moderate_or_greater_flag",
    "tricuspid_regurgitation_moderate_or_greater_flag",
    "pulmonary_regurgitation_moderate_or_greater_flag",
    "rv_systolic_dysfunction_moderate_or_greater_flag",
    "pericardial_effusion_moderate_large_flag",
    "pasp_gte_45_flag",
    "tr_max_gte_32_flag",
    "shd_moderate_or_greater_flag",
]

NUM_LABELS = len(LABELS)


def _prod(items):
    out = 1
    for x in items:
        out *= int(x)
    return out


def load_npy_tensor(npy_bytes):
    if not npy_bytes.startswith(b"\x93NUMPY"):
        raise ValueError("Invalid .npy file")
    major = npy_bytes[6]
    minor = npy_bytes[7]
    offset = 8
    if (major, minor) == (1, 0):
        header_len = struct.unpack("<H", npy_bytes[offset : offset + 2])[0]
        offset += 2
    elif (major, minor) in ((2, 0), (3, 0)):
        header_len = struct.unpack("<I", npy_bytes[offset : offset + 4])[0]
        offset += 4
    else:
        raise ValueError(f"Unsupported npy version {major}.{minor}")

    header = npy_bytes[offset : offset + header_len].decode("latin1").strip()
    offset += header_len
    header_dict = ast.literal_eval(header)
    descr = header_dict.get("descr")
    fortran_order = bool(header_dict.get("fortran_order"))
    shape = tuple(int(x) for x in header_dict.get("shape", ()))

    if fortran_order:
        raise ValueError("Fortran-order .npy is not supported")
    if not shape:
        raise ValueError("Invalid shape in .npy header")

    if descr in ("<f4", "|f4", "f4"):
        typecode = "f"
        itemsize = 4
        dtype = torch.float32
    elif descr in ("<f8", "|f8", "f8"):
        typecode = "d"
        itemsize = 8
        dtype = torch.float32
    elif descr in ("<i2", "|i2", "i2"):
        typecode = "h"
        itemsize = 2
        dtype = torch.int16
    elif descr in ("<i4", "|i4", "i4"):
        typecode = "i"
        itemsize = 4
        dtype = torch.int32
    elif descr in ("<u2", "|u2", "u2"):
        typecode = "H"
        itemsize = 2
        dtype = torch.int32
    elif descr in ("<u1", "|u1", "u1"):
        typecode = "B"
        itemsize = 1
        dtype = torch.int32
    else:
        raise ValueError(f"Unsupported dtype descr: {descr}")

    count = _prod(shape)
    data = npy_bytes[offset : offset + count * itemsize]
    if len(data) != count * itemsize:
        raise ValueError("Truncated .npy data")

    arr = array(typecode)
    arr.frombytes(data)
    tensor = torch.tensor(arr, dtype=dtype).reshape(shape)
    if tensor.dtype != torch.float32:
        tensor = tensor.float()
    return tensor


class InceptionBlock(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.b1 = nn.Conv1d(in_ch, out_ch, 1)
        self.b3 = nn.Conv1d(in_ch, out_ch, 3, padding=1)
        self.b5 = nn.Conv1d(in_ch, out_ch, 5, padding=2)
        self.pool = nn.Sequential(nn.MaxPool1d(3, stride=1, padding=1), nn.Conv1d(in_ch, out_ch, 1))
        self.bn = nn.BatchNorm1d(out_ch * 4)
        self.relu = nn.ReLU()

    def forward(self, x):
        x = torch.cat([self.b1(x), self.b3(x), self.b5(x), self.pool(x)], dim=1)
        return self.relu(self.bn(x))


class ECGModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.inc1 = InceptionBlock(12, 32)
        self.inc2 = InceptionBlock(128, 32)
        self.inc3 = InceptionBlock(128, 32)
        self.pool = nn.AdaptiveAvgPool1d(1)
        self.tab = nn.Sequential(nn.Linear(7, 64), nn.ReLU(), nn.Dropout(0.3))
        self.fc = nn.Sequential(nn.Linear(192, 128), nn.ReLU(), nn.Dropout(0.4), nn.Linear(128, NUM_LABELS))
        self.label_corr = nn.Parameter(torch.eye(NUM_LABELS))

    def forward(self, wave, tab):
        wave = wave.squeeze(1).permute(0, 2, 1)
        x1 = self.inc1(wave)
        x2 = self.inc2(x1) + x1
        x3 = self.inc3(x2) + x2
        x = self.pool(x3).squeeze(-1)
        t = self.tab(tab)
        fused = torch.cat([x, t], dim=1)
        logits = self.fc(fused)
        logits = logits + logits @ self.label_corr
        return logits


_MODEL = None
_DEVICE = torch.device("cpu")
_LEAD_STATS = None


def get_model():
    global _MODEL
    if _MODEL is not None:
        return _MODEL
    model_dir = os.path.dirname(__file__)
    candidates = [
        os.path.join(model_dir, "best_model.pth"),
        os.path.join(model_dir, "best_model.pth.zip"),
        os.path.join(model_dir, "best_model"),
    ]
    model_path = None
    for cand in candidates:
        if os.path.isfile(cand):
            model_path = cand
            break
    if model_path is None:
        raise FileNotFoundError(
            "Model weights not found. Expected one of: best_model.pth, best_model.pth.zip, best_model"
        )
    model = ECGModel().to(_DEVICE)
    state = torch.load(model_path, map_location=_DEVICE)
    model.load_state_dict(state)
    model.eval()
    _MODEL = model
    return model


def get_lead_stats(payload=None):
    global _LEAD_STATS
    if _LEAD_STATS is not None:
        return _LEAD_STATS

    if isinstance(payload, dict):
        mean = payload.get("leadMean")
        std = payload.get("leadStd")
        if isinstance(mean, list) and isinstance(std, list) and len(mean) == 12 and len(std) == 12:
            _LEAD_STATS = (torch.tensor(mean, dtype=torch.float32), torch.tensor(std, dtype=torch.float32))
            return _LEAD_STATS

    model_dir = os.path.dirname(__file__)
    cand = os.path.join(model_dir, "lead_stats.json")
    if os.path.isfile(cand):
        with open(cand, "r", encoding="utf-8") as f:
            data = json.load(f) or {}
        mean = data.get("lead_mean")
        std = data.get("lead_std")
        if isinstance(mean, list) and isinstance(std, list) and len(mean) == 12 and len(std) == 12:
            _LEAD_STATS = (torch.tensor(mean, dtype=torch.float32), torch.tensor(std, dtype=torch.float32))
            return _LEAD_STATS

    _LEAD_STATS = (None, None)
    return _LEAD_STATS


def to_wave_tensor(tensor):
    if tensor.dim() == 2 and tensor.shape[-1] == 12:
        wave = tensor
        wave = wave.unsqueeze(0).unsqueeze(0)
        return wave
    if tensor.dim() == 3 and tensor.shape[-1] == 12:
        if tensor.shape[0] == 1:
            return tensor.unsqueeze(0)
        return tensor.unsqueeze(1)
    if tensor.dim() == 4 and tensor.shape[-1] == 12:
        return tensor
    raise ValueError(f"Unsupported waveform shape: {tuple(tensor.shape)}")


def normalize_wave(wave, payload=None):
    mean_vec, std_vec = get_lead_stats(payload)
    if mean_vec is not None and std_vec is not None:
        mean = mean_vec.view(1, 1, 1, 12).to(wave.device)
        std = std_vec.view(1, 1, 1, 12).to(wave.device)
        std = torch.clamp(std, min=1e-6)
        return (wave - mean) / std

    mean = wave.mean(dim=2, keepdim=True)
    var = (wave - mean).pow(2).mean(dim=2, keepdim=True)
    std = var.sqrt() + 1e-6
    return (wave - mean) / std


def to_tabular_tensor(tensor):
    if tensor is None:
        raise ValueError("Missing tabular data")
    t = tensor
    if t.dtype != torch.float32:
        t = t.float()
    t = t.reshape(-1)
    if t.numel() != 7:
        raise ValueError(f"Tabular .npy must contain exactly 7 values, got {int(t.numel())}")
    return t.view(1, 7)


def main():
    raw = sys.stdin.read()
    payload = json.loads(raw or "{}")
    file_name = str(payload.get("fileName") or "")
    file_b64 = str(payload.get("fileBase64") or "")
    if not file_name or not file_b64:
        raise ValueError("fileName and fileBase64 are required")

    decoded = base64.b64decode(file_b64)
    wave_raw = load_npy_tensor(decoded)
    wave = to_wave_tensor(wave_raw).to(_DEVICE).float()
    wave = normalize_wave(wave, payload)

    tab_file_b64 = payload.get("tabFileBase64")
    tab_tensor = None
    if isinstance(tab_file_b64, str) and tab_file_b64:
        tab_decoded = base64.b64decode(tab_file_b64)
        tab_raw = load_npy_tensor(tab_decoded)
        tab_tensor = to_tabular_tensor(tab_raw).to(_DEVICE)
    else:
        tab = payload.get("tab")
        if isinstance(tab, list) and len(tab) == 7:
            tab_tensor = torch.tensor([tab], dtype=torch.float32, device=_DEVICE)
        else:
            tab_tensor = torch.zeros((1, 7), dtype=torch.float32, device=_DEVICE)

    model = get_model()
    with torch.no_grad():
        logits = model(wave, tab_tensor)
        probs = torch.sigmoid(logits).squeeze(0).tolist()

    prob_map = {LABELS[i]: float(probs[i]) for i in range(NUM_LABELS)}
    pairs = sorted(prob_map.items(), key=lambda kv: kv[1], reverse=True)
    top_labels = [{"label": k, "probability": float(v)} for k, v in pairs[:5]]
    shd_prob = float(prob_map.get("shd_moderate_or_greater_flag", 0.0))

    out = {
        "probabilities": prob_map,
        "top_labels": top_labels,
        "shd_probability": shd_prob,
    }
    sys.stdout.write(json.dumps(out))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        sys.stderr.write(str(exc))
        sys.exit(1)
