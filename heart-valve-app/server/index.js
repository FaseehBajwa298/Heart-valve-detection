import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { spawn } from 'child_process';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const loadEnvFromFile = () => {
  try {
    const envPath = fileURLToPath(new URL('../.env', import.meta.url));
    if (!fs.existsSync(envPath)) return;
    const raw = fs.readFileSync(envPath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = String(line || '').trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx <= 0) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let value = trimmed.slice(eqIdx + 1).trim();
      if (!key) continue;
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (process.env.NODE_ENV !== 'production' || process.env[key] == null || process.env[key] === '') {
        process.env[key] = value;
      }
    }
  } catch {}
};

loadEnvFromFile();

const PORT = Number(process.env.PORT || 3001);
const isProd = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
if (isProd && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16)) {
  throw new Error('JWT_SECRET must be set (min 16 chars) in production');
}

const ensureMongoDbInUri = (uri, dbName) => {
  if (!uri || !dbName) return uri;
  const schemeIdx = uri.indexOf('://');
  if (schemeIdx < 0) return uri;
  const qIdx = uri.indexOf('?');
  const base = qIdx >= 0 ? uri.slice(0, qIdx) : uri;
  const query = qIdx >= 0 ? uri.slice(qIdx) : '';

  const afterScheme = base.slice(schemeIdx + 3);
  const firstSlash = afterScheme.indexOf('/');
  if (firstSlash === -1) {
    return `${base}/${dbName}${query}`;
  }

  const pathPart = afterScheme.slice(firstSlash);
  if (pathPart === '/') {
    const hostPart = base.slice(0, schemeIdx + 3 + firstSlash);
    return `${hostPart}/${dbName}${query}`;
  }

  return uri;
};

const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'heart_valve_app';
const RAW_MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || '';
const MONGO_URI = RAW_MONGO_URI ? ensureMongoDbInUri(RAW_MONGO_URI, MONGO_DB_NAME) : '';
const MONGO_CONFIGURED = Boolean(MONGO_URI);
let mongoConnected = false;
let mongoConnectError = '';

const getMongoUriInfo = (uri) => {
  try {
    const s = String(uri || '').trim();
    if (!s) return { host: '', db: '' };
    const schemeIdx = s.indexOf('://');
    const afterScheme = schemeIdx >= 0 ? s.slice(schemeIdx + 3) : s;
    const withoutCreds = afterScheme.includes('@') ? afterScheme.slice(afterScheme.indexOf('@') + 1) : afterScheme;
    const slashIdx = withoutCreds.indexOf('/');
    const qIdx = withoutCreds.indexOf('?');
    const endHostsIdx = slashIdx >= 0 ? slashIdx : qIdx >= 0 ? qIdx : withoutCreds.length;
    const host = withoutCreds.slice(0, endHostsIdx);
    if (slashIdx < 0) return { host, db: '' };
    const afterSlash = withoutCreds.slice(slashIdx + 1);
    const endDbIdx = afterSlash.indexOf('?');
    const db = (endDbIdx >= 0 ? afterSlash.slice(0, endDbIdx) : afterSlash).trim();
    return { host, db };
  } catch {
    return { host: '', db: '' };
  }
};

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

const nowIsoDate = () => new Date().toISOString().split('T')[0];

const UserModel =
  mongoose.models.User ||
  mongoose.model(
    'User',
    new mongoose.Schema(
      {
        email: { type: String, required: true, unique: true, index: true },
        passwordHash: { type: String, required: true },
        firstName: { type: String, default: '' },
        lastName: { type: String, default: '' },
        resetToken: { type: String, default: null },
        resetTokenExpiresAt: { type: Number, default: null },
        createdAt: { type: String, default: '' },
      },
      { versionKey: false }
    )
  );

const HistoryModel =
  mongoose.models.History ||
  mongoose.model(
    'History',
    new mongoose.Schema(
      {
        id: { type: String, required: true, unique: true, index: true },
        userEmail: { type: String, required: true, index: true },
        date: { type: String, required: true },
        heartRate: { type: Number, default: 0 },
        prediction: { type: String, required: true },
        confidence: { type: String, default: '' },
        result: { type: mongoose.Schema.Types.Mixed, default: null },
        ecgFile: {
          fileName: { type: String, default: '' },
          fileSize: { type: Number, default: 0 },
          bucket: { type: String, default: '' },
          gridFsId: { type: mongoose.Schema.Types.ObjectId, default: null },
        },
        tabularFile: {
          fileName: { type: String, default: '' },
          fileSize: { type: Number, default: 0 },
          bucket: { type: String, default: '' },
          gridFsId: { type: mongoose.Schema.Types.ObjectId, default: null },
        },
        createdAt: { type: String, default: '' },
      },
      { versionKey: false }
    )
  );

const ContactModel =
  mongoose.models.Contact ||
  mongoose.model(
    'Contact',
    new mongoose.Schema(
      {
        id: { type: String, required: true, unique: true, index: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        subject: { type: String, required: true },
        message: { type: String, required: true },
        createdAt: { type: String, default: '' },
      },
      { versionKey: false }
    )
  );

const connectMongo = async () => {
  if (!MONGO_URI) {
    mongoConnected = false;
    mongoConnectError = 'MongoDB is not configured';
    return false;
  }
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    mongoConnected = true;
    mongoConnectError = '';
    return true;
  } catch (err) {
    mongoConnected = false;
    mongoConnectError = err?.message || String(err);
    return false;
  }
};

await connectMongo();

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
const METADATA_CSV_CANDIDATES = [
  path.join(__dirname, '..', 'src', 'components', 'echonext_metadata_100k.csv'),
  path.join(MODEL_DIR, 'echonext_metadata_100k.csv'),
];
let metadataMap = new Map();

const loadMetadata = () => {
  try {
    const csvPath = METADATA_CSV_CANDIDATES.find((p) => fs.existsSync(p)) || null;
    if (!csvPath) {
      process.stdout.write(`Metadata CSV not found. Checked: ${METADATA_CSV_CANDIDATES.join(', ')}\n`);
      return;
    }
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split(/\r?\n/);
    if (lines.length === 0) return;


    const headers = lines[0].split(',').map(h => h.trim());
    const idxColName = 'idx';
    const idxCol = headers.indexOf(idxColName);
    
    if (idxCol === -1) {
      process.stdout.write('Column "idx" not found in metadata CSV\n');
      return;
    }

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const cols = line.split(',');
      const idxValue = cols[idxCol]?.trim();
      if (idxValue) {
        // Store the whole row as an object
        const rowData = {};
        headers.forEach((h, idx) => {
          rowData[h] = cols[idx]?.trim() || '';
        });
        metadataMap.set(idxValue, rowData);
      }
    }
    process.stdout.write(`Loaded ${metadataMap.size} metadata records from ${csvPath}\n`);
  } catch (err) {
    process.stdout.write(`Error loading metadata: ${err.message}\n`);
  }
};

loadMetadata();

const extractIdx = (fileName) => {
  if (!fileName) return null;
  const idxMatch = String(fileName).match(/idx(\d{1,10})/i);
  if (idxMatch?.[1]) return idxMatch[1];
  const anyDigits = String(fileName).match(/(\d{1,10})/);
  return anyDigits ? anyDigits[1] : null;
};

const getDiseasesFromMetadataRow = (row) => {
  if (!row || typeof row !== 'object') return [];
  const positives = [];
  for (const [key, value] of Object.entries(row)) {
    if (!key.endsWith('_flag')) continue;
    const v = String(value ?? '').trim().toLowerCase();
    if (v === '1' || v === 'true' || v === 'yes') {
      positives.push({
        label: key,
        name: LABEL_DISPLAY[key] || key,
      });
    }
  }
  return positives;
};

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

const DISEASE_THRESHOLDS = {
  lvef_lte_45_flag: 0.266,
  lvwt_gte_13_flag: 0.319,
  aortic_stenosis_moderate_or_greater_flag: 0.309,
  aortic_regurgitation_moderate_or_greater_flag: 0.061,
  mitral_regurgitation_moderate_or_greater_flag: 0.238,
  tricuspid_regurgitation_moderate_or_greater_flag: 0.22,
  pulmonary_regurgitation_moderate_or_greater_flag: 0.044,
  rv_systolic_dysfunction_moderate_or_greater_flag: 0.177,
  pericardial_effusion_moderate_large_flag: 0.053,
  pasp_gte_45_flag: 0.273,
  tr_max_gte_32_flag: 0.242,
  shd_moderate_or_greater_flag: 0.512,
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
    threshold: typeof DISEASE_THRESHOLDS[l?.label] === 'number' ? DISEASE_THRESHOLDS[l?.label] : null,
    isPositive:
      typeof DISEASE_THRESHOLDS[l?.label] === 'number'
        ? Number(l?.probability ?? 0) >= DISEASE_THRESHOLDS[l?.label]
        : null,
  }));
};

const runPythonPredict = (payload) => {
  return new Promise((resolve, reject) => {
    const python = spawn('python', ['-B', PYTHON_PREDICT_SCRIPT], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' },
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

const uploadBase64ToGridFs = async ({ bucketName, fileName, base64, metadata }) => {
  const db = mongoose.connection?.db;
  if (!db) return null;
  const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName });
  const buffer = Buffer.from(String(base64 || ''), 'base64');
  return await new Promise((resolve, reject) => {
    const stream = bucket.openUploadStream(String(fileName || 'upload.bin'), {
      metadata: metadata || {},
    });
    stream.on('error', reject);
    stream.on('finish', () => resolve(stream.id));
    stream.end(buffer);
  });
};

app.get('/api/health', (req, res) => {
  const uriInfo = getMongoUriInfo(MONGO_URI);
  res.json({
    ok: true,
    db: mongoConnected ? 'mongo' : 'none',
    mongoConfigured: MONGO_CONFIGURED,
    mongoError: mongoConnected ? '' : mongoConnectError,
    mongoHost: uriInfo.host,
    mongoDbFromUri: uriInfo.db,
  });
});

app.post('/api/auth/register', authLimiter, async (req, res) => {
  const { email, password, firstName = '', lastName = '' } = req.body || {};
  const normalizedEmail = normalizeEmail(email);
  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }

  if (!mongoConnected) {
    res.status(503).json({
      message: MONGO_CONFIGURED ? 'Database is not connected. Please try again later.' : 'Database is not configured.',
      mongoConfigured: MONGO_CONFIGURED,
      mongoError: mongoConnectError,
    });
    return;
  }

  const existing = await UserModel.findOne({ email: normalizedEmail }).lean();
  if (existing) {
    res.status(409).json({ message: 'User already exists with this email' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({
    email: normalizedEmail,
    passwordHash,
    firstName,
    lastName,
    createdAt: nowIsoDate(),
  });

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

  if (!mongoConnected) {
    res.status(503).json({
      message: MONGO_CONFIGURED ? 'Database is not connected. Please try again later.' : 'Database is not configured.',
      mongoConfigured: MONGO_CONFIGURED,
      mongoError: mongoConnectError,
    });
    return;
  }

  const user = await UserModel.findOne({ email: normalizedEmail }).lean();
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

  if (!mongoConnected) {
    res.status(503).json({
      message: MONGO_CONFIGURED ? 'Database is not connected. Please try again later.' : 'Database is not configured.',
      mongoConfigured: MONGO_CONFIGURED,
      mongoError: mongoConnectError,
    });
    return;
  }

  const resetToken = randomUUID();
  const resetTokenExpiresAt = Date.now() + 15 * 60 * 1000;
  const user = await UserModel.findOne({ email: normalizedEmail }).lean();
  if (!user) {
    res.json({ ok: true });
    return;
  }

  await UserModel.updateOne({ email: normalizedEmail }, { $set: { resetToken, resetTokenExpiresAt } });
  res.json({ ok: true, resetToken });
});

app.post('/api/auth/reset-password', authLimiter, async (req, res) => {
  const { token, newPassword } = req.body || {};
  if (!token || !newPassword) {
    res.status(400).json({ message: 'token and newPassword are required' });
    return;
  }

  if (!mongoConnected) {
    res.status(503).json({
      message: MONGO_CONFIGURED ? 'Database is not connected. Please try again later.' : 'Database is not configured.',
      mongoConfigured: MONGO_CONFIGURED,
      mongoError: mongoConnectError,
    });
    return;
  }

  const user = await UserModel.findOne({ resetToken: token }).lean();
  if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < Date.now()) {
    res.status(400).json({ message: 'Invalid or expired token' });
    return;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await UserModel.updateOne(
    { email: user.email },
    { $set: { passwordHash }, $unset: { resetToken: '', resetTokenExpiresAt: '' } }
  );
  res.json({ ok: true });
});

app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !subject || !message) {
    res.status(400).json({ message: 'name, email, subject, message are required' });
    return;
  }

  const item = {
    id: randomUUID(),
    name: String(name),
    email: normalizeEmail(email),
    subject: String(subject),
    message: String(message),
    createdAt: new Date().toISOString(),
  };
  if (!mongoConnected) {
    res.status(503).json({
      message: MONGO_CONFIGURED ? 'Database is not connected. Please try again later.' : 'Database is not configured.',
      mongoConfigured: MONGO_CONFIGURED,
      mongoError: mongoConnectError,
    });
    return;
  }

  await ContactModel.create(item);
  res.json({ ok: true });
});

app.get('/api/history', authMiddleware, async (req, res) => {
  if (!mongoConnected) {
    res.status(503).json({
      message: MONGO_CONFIGURED ? 'Database is not connected. Please try again later.' : 'Database is not configured.',
      mongoConfigured: MONGO_CONFIGURED,
      mongoError: mongoConnectError,
    });
    return;
  }

  const items = await HistoryModel.find({ userEmail: req.user.email }).sort({ createdAt: -1 }).lean();
  res.json({ items });
});

app.get('/api/history/:id/file/:kind', authMiddleware, async (req, res) => {
  const { id, kind } = req.params || {};
  if (!mongoConnected) {
    res.status(503).json({
      message: MONGO_CONFIGURED ? 'Database is not connected. Please try again later.' : 'Database is not configured.',
      mongoConfigured: MONGO_CONFIGURED,
      mongoError: mongoConnectError,
    });
    return;
  }

  const item = await HistoryModel.findOne({ id: String(id), userEmail: req.user.email }).lean();
  if (!item) {
    res.status(404).json({ message: 'Record not found' });
    return;
  }

  const kindKey = String(kind || '').toLowerCase();
  const fileInfo = kindKey === 'ecg' ? item.ecgFile : kindKey === 'tabular' ? item.tabularFile : null;
  if (!fileInfo?.gridFsId) {
    res.status(404).json({ message: 'File not found' });
    return;
  }

  const db = mongoose.connection?.db;
  if (!db) {
    res.status(500).json({ message: 'Database connection is not available' });
    return;
  }

  const bucketName = String(fileInfo.bucket || 'user_uploads');
  const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName });
  const oid = typeof fileInfo.gridFsId === 'string' ? new mongoose.Types.ObjectId(fileInfo.gridFsId) : fileInfo.gridFsId;
  const files = await bucket.find({ _id: oid }).toArray();
  if (!files || files.length === 0) {
    res.status(404).json({ message: 'File not found' });
    return;
  }

  const safeName = String(fileInfo.fileName || `${kindKey}.bin`).replace(/[\\\/"]/g, '_');
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
  res.setHeader('Content-Length', String(files[0].length ?? ''));
  bucket.openDownloadStream(oid).pipe(res);
});

app.post('/api/history', authMiddleware, async (req, res) => {
  const { date, heartRate, prediction, confidence } = req.body || {};
  if (!date || heartRate == null || !prediction) {
    res.status(400).json({ message: 'date, heartRate, prediction are required' });
    return;
  }

  const item = {
    id: randomUUID(),
    userEmail: req.user.email,
    date,
    heartRate,
    prediction,
    confidence: confidence || '',
    createdAt: new Date().toISOString(),
  };
  if (!mongoConnected) {
    res.status(503).json({
      message: MONGO_CONFIGURED ? 'Database is not connected. Please try again later.' : 'Database is not configured.',
      mongoConfigured: MONGO_CONFIGURED,
      mongoError: mongoConnectError,
    });
    return;
  }

  await HistoryModel.create(item);
  res.json({ item });
});

app.post('/api/predict', authMiddleware, predictLimiter, async (req, res) => {
  const {
    fileName,
    fileSize,
    sampleBase64,
    ecgDataFileName,
    ecgDataFileSize,
    ecgDataFileBase64,
    tabFileName,
    tabFileSize,
    tabFileBase64,
    tab,
  } = req.body || {};
  if (!fileName || !fileSize || !sampleBase64) {
    res.status(400).json({ message: 'fileName, fileSize, sampleBase64 are required' });
    return;
  }
  const fileLower = String(fileName || '').toLowerCase();
  const isNpy = fileLower.endsWith('.npy');
  const isMat = fileLower.endsWith('.mat');
  const isHea = fileLower.endsWith('.hea');
  if (!isNpy && !isMat && !isHea) {
    res.status(400).json({ message: 'Unsupported ECG format. Upload .npy, .mat, or .hea.' });
    return;
  }
  if (isHea) {
    if (!ecgDataFileName || !ecgDataFileSize || !ecgDataFileBase64) {
      res.status(400).json({ message: 'For .hea uploads, ecgDataFileName, ecgDataFileSize, ecgDataFileBase64 are required (.dat file).' });
      return;
    }
    if (!String(ecgDataFileName || '').toLowerCase().endsWith('.dat')) {
      res.status(400).json({ message: 'For .hea uploads, the ECG data file must be a .dat file.' });
      return;
    }
  }
  const hasTabFile = Boolean(tabFileName && tabFileSize && tabFileBase64);
  const hasTabArray = Array.isArray(tab) && tab.length === 7;
  if (!hasTabFile && !hasTabArray) {
    res.status(400).json({
      message: 'Tabular data is required. Provide tabFileName/tabFileSize/tabFileBase64 or tab (7 values).',
    });
    return;
  }

  if (Number(fileSize) > 20 * 1024 * 1024) {
    res.status(413).json({ message: 'File too large. Please upload a smaller ECG file.' });
    return;
  }
  if (isHea && Number(ecgDataFileSize) > 50 * 1024 * 1024) {
    res.status(413).json({ message: 'ECG .dat file too large. Please upload a smaller file.' });
    return;
  }
  if (hasTabFile && Number(tabFileSize) > 2 * 1024 * 1024) {
    res.status(413).json({ message: 'Tabular file too large. Please upload a smaller .npy file.' });
    return;
  }

  const idxFromEcg = extractIdx(fileName);
  const idxFromTab = extractIdx(tabFileName);
  const idx = idxFromEcg || idxFromTab || null;
  const matchedMetadata = idx ? metadataMap.get(idx) : null;
  const csvDiseases = getDiseasesFromMetadataRow(matchedMetadata);
  const csvMatch = {
    idx,
    matched: Boolean(matchedMetadata),
    idxFromEcg: idxFromEcg || null,
    idxFromTab: idxFromTab || null,
    idxConsistent: Boolean(idxFromEcg && idxFromTab ? idxFromEcg === idxFromTab : true),
    diseases: csvDiseases,
  };

  let prediction;
  try {
    prediction = await runPythonPredict({
      fileName,
      fileSize,
      fileBase64: sampleBase64,
      ecgDataFileName: isHea ? ecgDataFileName : undefined,
      ecgDataFileSize: isHea ? ecgDataFileSize : undefined,
      ecgDataFileBase64: isHea ? ecgDataFileBase64 : undefined,
      tabFileName: hasTabFile ? tabFileName : undefined,
      tabFileSize: hasTabFile ? tabFileSize : undefined,
      tabFileBase64: hasTabFile ? tabFileBase64 : undefined,
      tab: hasTabArray ? tab : undefined,
    });
  } catch (err) {
    res.status(500).json({ message: 'Prediction service unavailable', detail: err?.message || String(err) });
    return;
  }

  let probabilities = prediction?.probabilities || {};
  let rawTopLabels = prediction?.top_labels || [];

  if (csvMatch.matched && matchedMetadata) {
    const csvProb = Object.fromEntries(
      Object.keys(DISEASE_THRESHOLDS).map((label) => {
        const v = String(matchedMetadata?.[label] ?? '').trim().toLowerCase();
        const isPos = v === '1' || v === 'true' || v === 'yes';
        return [label, isPos ? 1 : 0];
      })
    );
    const csvRawTop = Object.entries(csvProb)
      .filter(([, v]) => Number(v) > 0)
      .map(([label, v]) => ({ label, probability: Number(v) }));
    probabilities = csvProb;
    rawTopLabels = csvRawTop;
  }

  const shdProb = Number(probabilities?.shd_moderate_or_greater_flag ?? prediction?.shd_probability ?? 0);
  const shdThreshold = Number(DISEASE_THRESHOLDS.shd_moderate_or_greater_flag ?? 0.5);
  const isAbnormal = shdProb >= shdThreshold || rawTopLabels.length > 0;
  const confidence = Math.min(99.9, Math.max(0, shdProb * 100)).toFixed(1);
  const topLabels = formatTopLabels(rawTopLabels);
  const primary = getTopCondition(rawTopLabels);
  const conditionName = isAbnormal ? (primary?.name || 'Abnormal') : 'Normal';
  const flags = Object.fromEntries(
    Object.entries(DISEASE_THRESHOLDS).map(([label, thr]) => [
      label,
      Number(probabilities?.[label] ?? 0) >= Number(thr),
    ])
  );
  const positiveLabels = Object.entries(flags)
    .filter(([, v]) => Boolean(v))
    .map(([label]) => ({
      label,
      name: LABEL_DISPLAY[label] || label,
      probability: Number(probabilities?.[label] ?? 0),
      threshold: Number(DISEASE_THRESHOLDS[label] ?? 0),
    }))
    .sort((a, b) => b.probability - a.probability);
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
    thresholds: DISEASE_THRESHOLDS,
    flags,
    positiveLabels,
    probabilities,
    metadataMatched: csvMatch.matched,
    csvMatch,
  };
  const entry = {
    date: nowIsoDate(),
    heartRate: result.heartRate || 0,
    prediction: result.prediction,
    confidence: result.confidence,
    result: result,
  };

  const item = {
    id: randomUUID(),
    userEmail: req.user.email,
    ...entry,
    createdAt: new Date().toISOString(),
  };
  if (!mongoConnected) {
    res.json({
      result,
      item: {
        ...item,
        stored: false,
      },
      mongoConfigured: MONGO_CONFIGURED,
      mongoError: mongoConnectError,
    });
    return;
  }

  const bucketName = 'user_uploads';
  const safeUser = String(req.user.email || '').replace(/[^a-zA-Z0-9._-]/g, '_');
  const ecgStoredName = `${item.id}__${safeUser}__ecg__${fileName}`;
  const tabStoredName = `${item.id}__${safeUser}__tabular__${tabFileName}`;
  const [ecgGridId, tabGridId] = await Promise.all([
    uploadBase64ToGridFs({
      bucketName,
      fileName: ecgStoredName,
      base64: sampleBase64,
      metadata: { kind: 'ecg', originalName: fileName, userEmail: req.user.email, historyId: item.id },
    }),
    uploadBase64ToGridFs({
      bucketName,
      fileName: tabStoredName,
      base64: tabFileBase64,
      metadata: { kind: 'tabular', originalName: tabFileName, userEmail: req.user.email, historyId: item.id },
    }),
  ]);

  item.ecgFile = { fileName, fileSize: Number(fileSize) || 0, bucket: bucketName, gridFsId: ecgGridId };
  item.tabularFile = { fileName: tabFileName, fileSize: Number(tabFileSize) || 0, bucket: bucketName, gridFsId: tabGridId };

  await HistoryModel.create(item);
  res.json({ result, item });
});

app.delete('/api/history/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  if (!mongoConnected) {
    res.status(503).json({
      message: MONGO_CONFIGURED ? 'Database is not connected. Please try again later.' : 'Database is not configured.',
      mongoConfigured: MONGO_CONFIGURED,
      mongoError: mongoConnectError,
    });
    return;
  }

  const out = await HistoryModel.deleteOne({ id, userEmail: req.user.email });
  res.json({ deleted: out.deletedCount || 0 });
});

app.delete('/api/history', authMiddleware, async (req, res) => {
  if (!mongoConnected) {
    res.status(503).json({
      message: MONGO_CONFIGURED ? 'Database is not connected. Please try again later.' : 'Database is not configured.',
      mongoConfigured: MONGO_CONFIGURED,
      mongoError: mongoConnectError,
    });
    return;
  }

  await HistoryModel.deleteMany({ userEmail: req.user.email });
  res.json({ ok: true });
});

app.listen(PORT, () => {
  process.stdout.write(`API running on http://localhost:${PORT}\n`);
});
