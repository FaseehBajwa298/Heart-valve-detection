import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { spawn } from 'child_process';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { fileURLToPath } from 'url';
import path from 'path';

const PORT = Number(process.env.PORT || 3001);
const isProd = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
if (isProd && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16)) {
  throw new Error('JWT_SECRET must be set (min 16 chars) in production');
}

const app = express();
if (isProd) {
  const allowed = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (allowed.includes(origin)) return cb(null, true);
        return cb(new Error('Not allowed by CORS'));
      },
      credentials: true,
    })
  );
} else {
  app.use(cors());
}

app.use(express.json({ limit: '30mb' }));

const dbFilePath = fileURLToPath(new URL('./db.json', import.meta.url));
const adapter = new JSONFile(dbFilePath);
const db = new Low(adapter, { users: [], history: [], contacts: [] });
const ensureDbShape = () => {
  db.data ||= {};
  db.data.users ||= [];
  db.data.history ||= [];
  db.data.contacts ||= [];
};
const readDb = async () => {
  await db.read();
  ensureDbShape();
};
await readDb();

const nowIsoDate = () => new Date().toISOString().split('T')[0];

const createToken = (user) => {
  return jwt.sign(
    { sub: user.email, email: user.email, firstName: user.firstName || '' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';
  if (!token) {
    res.status(401).json({ message: 'Missing token' });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { email: payload.email, firstName: payload.firstName };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const createRateLimiter = ({ windowMs, max }) => {
  const hits = new Map();
  return (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = hits.get(ip);
    if (!entry || entry.resetAt <= now) {
      hits.set(ip, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }
    entry.count += 1;
    if (entry.count > max) {
      res.status(429).json({ message: 'Too many requests. Please try again later.' });
      return;
    }
    next();
  };
};

const authLimiter = createRateLimiter({ windowMs: 60_000, max: 30 });
const contactLimiter = createRateLimiter({ windowMs: 60_000, max: 20 });
const predictLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MODEL_DIR = path.join(__dirname, 'models');
const PYTHON_PREDICT_SCRIPT = path.join(MODEL_DIR, 'predict_pytorch.py');

const LABEL_DISPLAY = {
  lvef_lte_45_flag: 'Reduced LVEF (≤45%)',
  lvwt_gte_13_flag: 'Increased LV Wall Thickness (≥13mm)',
  aortic_stenosis_moderate_or_greater_flag: 'Aortic Stenosis (Moderate+)',
  aortic_regurgitation_moderate_or_greater_flag: 'Aortic Regurgitation (Moderate+)',
  mitral_regurgitation_moderate_or_greater_flag: 'Mitral Regurgitation (Moderate+)',
  tricuspid_regurgitation_moderate_or_greater_flag: 'Tricuspid Regurgitation (Moderate+)',
  pulmonary_regurgitation_moderate_or_greater_flag: 'Pulmonary Regurgitation (Moderate+)',
  rv_systolic_dysfunction_moderate_or_greater_flag: 'RV Systolic Dysfunction (Moderate+)',
  pericardial_effusion_moderate_large_flag: 'Pericardial Effusion (Moderate/Large)',
  pasp_gte_45_flag: 'PASP ≥45 mmHg',
  tr_max_gte_32_flag: 'TR Max ≥3.2 m/s',
  shd_moderate_or_greater_flag: 'Structural Heart Disease (Moderate+)',
};

const formatPercent = (value) => `${(Math.max(0, Math.min(1, Number(value) || 0)) * 100).toFixed(1)}%`;

const getTopCondition = (topLabels) => {
  const candidates = (topLabels || []).filter((l) => l?.label && l.label !== 'shd_moderate_or_greater_flag');
  if (candidates.length === 0) return null;
  const top = candidates[0];
  const name = LABEL_DISPLAY[top.label] || top.label;
  const prob = Number(top.probability ?? 0);
  return { label: top.label, name, probability: prob };
};

const formatTopLabels = (topLabels) => {
  return (topLabels || []).map((l) => ({
    label: l?.label,
    name: LABEL_DISPLAY[l?.label] || l?.label,
    probability: Number(l?.probability ?? 0),
    confidence: formatPercent(l?.probability),
  }));
};

const runPythonPredict = (payload) => {
  return new Promise((resolve, reject) => {
    const python = spawn('python', [PYTHON_PREDICT_SCRIPT], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    python.stdout.on('data', (chunk) => {
      stdout += chunk.toString('utf8');
    });
    python.stderr.on('data', (chunk) => {
      stderr += chunk.toString('utf8');
    });
    python.on('error', (err) => {
      reject(err);
    });
    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || stdout || `Python exited with code ${code}`));
        return;
      }
      try {
        const parsed = JSON.parse(stdout);
        resolve(parsed);
      } catch (err) {
        reject(new Error(`Invalid Python output. ${err?.message || err}`));
      }
    });

    python.stdin.write(JSON.stringify(payload));
    python.stdin.end();
  });
};

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/auth/register', authLimiter, async (req, res) => {
  const { email, password, firstName = '', lastName = '' } = req.body || {};
  const normalizedEmail = normalizeEmail(email);
  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }

  await readDb();
  const existing = db.data.users.find((u) => u.email === normalizedEmail);
  if (existing) {
    res.status(409).json({ message: 'User already exists with this email' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = { email: normalizedEmail, passwordHash, firstName, lastName, createdAt: nowIsoDate() };
  db.data.users.push(user);
  await db.write();

  const token = createToken(user);
  res.json({ token, user: { email: user.email, firstName: user.firstName, lastName: user.lastName } });
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = normalizeEmail(email);
  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }

  await db.read();
  const user = db.data.users.find((u) => u.email === normalizedEmail);
  if (!user) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const token = createToken(user);
  res.json({ token, user: { email: user.email, firstName: user.firstName, lastName: user.lastName } });
});

app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
  const { email } = req.body || {};
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    res.status(400).json({ message: 'Email is required' });
    return;
  }

  await readDb();
  const user = db.data.users.find((u) => u.email === normalizedEmail);
  if (!user) {
    res.json({ ok: true });
    return;
  }

  const resetToken = randomUUID();
  user.resetToken = resetToken;
  user.resetTokenExpiresAt = Date.now() + 15 * 60 * 1000;
  await db.write();
  res.json({ ok: true, resetToken });
});

app.post('/api/auth/reset-password', authLimiter, async (req, res) => {
  const { token, newPassword } = req.body || {};
  if (!token || !newPassword) {
    res.status(400).json({ message: 'token and newPassword are required' });
    return;
  }

  await readDb();
  const user = db.data.users.find((u) => u.resetToken === token);
  if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < Date.now()) {
    res.status(400).json({ message: 'Invalid or expired token' });
    return;
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  delete user.resetToken;
  delete user.resetTokenExpiresAt;
  await db.write();
  res.json({ ok: true });
});

app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !subject || !message) {
    res.status(400).json({ message: 'name, email, subject, message are required' });
    return;
  }

  await readDb();
  const item = {
    id: randomUUID(),
    name: String(name),
    email: normalizeEmail(email),
    subject: String(subject),
    message: String(message),
    createdAt: new Date().toISOString(),
  };
  db.data.contacts.push(item);
  await db.write();
  res.json({ ok: true });
});

app.get('/api/history', authMiddleware, async (req, res) => {
  await readDb();
  const items = db.data.history
    .filter((h) => h.userEmail === req.user.email)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  res.json({ items });
});

app.post('/api/history', authMiddleware, async (req, res) => {
  const { date, heartRate, prediction, confidence } = req.body || {};
  if (!date || heartRate == null || !prediction) {
    res.status(400).json({ message: 'date, heartRate, prediction are required' });
    return;
  }

  await db.read();
  const item = {
    id: randomUUID(),
    userEmail: req.user.email,
    date,
    heartRate,
    prediction,
    confidence: confidence || '',
    createdAt: new Date().toISOString(),
  };
  db.data.history.push(item);
  await db.write();
  res.json({ item });
});

app.post('/api/predict', authMiddleware, predictLimiter, async (req, res) => {
  const { fileName, fileSize, sampleBase64 } = req.body || {};
  if (!fileName || !fileSize || !sampleBase64) {
    res.status(400).json({ message: 'fileName, fileSize, sampleBase64 are required' });
    return;
  }

  if (Number(fileSize) > 20 * 1024 * 1024) {
    res.status(413).json({ message: 'File too large. Please upload a smaller ECG file.' });
    return;
  }

  let prediction;
  try {
    prediction = await runPythonPredict({ fileName, fileSize, fileBase64: sampleBase64 });
  } catch (err) {
    res.status(500).json({ message: 'Prediction service unavailable', detail: err?.message || String(err) });
    return;
  }

  const shdProb = Number(prediction?.shd_probability ?? 0);
  const isAbnormal = shdProb >= 0.5;
  const confidence = Math.min(99.9, Math.max(0, shdProb * 100)).toFixed(1);
  const topLabels = formatTopLabels(prediction?.top_labels || []);
  const primary = getTopCondition(prediction?.top_labels || []);
  const conditionName = isAbnormal ? (primary?.name || 'Abnormal') : 'Normal';
  const result = {
    condition: conditionName,
    prediction: isAbnormal ? 'Abnormal' : 'Normal',
    confidence: `${confidence}%`,
    heartRate: null,
    recommendation: isAbnormal
      ? `Possible indicators detected${primary?.name ? ` (${primary.name})` : ''}. Please consult a cardiologist for further evaluation.`
      : 'No strong abnormal indicators detected. Maintain a healthy lifestyle and regular checkups.',
    primaryCondition: primary,
    topLabels,
    probabilities: prediction?.probabilities || {},
  };
  const entry = {
    date: nowIsoDate(),
    heartRate: result.heartRate || 0,
    prediction: result.prediction,
    confidence: result.confidence,
    result: result, // Store the full result object for detailed report view
  };

  await readDb();
  const item = {
    id: randomUUID(),
    userEmail: req.user.email,
    ...entry,
    createdAt: new Date().toISOString(),
  };
  db.data.history.push(item);
  await db.write();

  res.json({ result, item });
});

app.delete('/api/history/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  await readDb();
  const before = db.data.history.length;
  db.data.history = db.data.history.filter((h) => !(h.id === id && h.userEmail === req.user.email));
  const after = db.data.history.length;
  await db.write();
  res.json({ deleted: before - after });
});

app.delete('/api/history', authMiddleware, async (req, res) => {
  await readDb();
  db.data.history = db.data.history.filter((h) => h.userEmail !== req.user.email);
  await db.write();
  res.json({ ok: true });
});

app.listen(PORT, () => {
  process.stdout.write(`API running on http://localhost:${PORT}\n`);
});
