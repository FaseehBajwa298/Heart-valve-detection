import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { fileURLToPath } from 'url';

const PORT = Number(process.env.PORT || 3001);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const dbFilePath = fileURLToPath(new URL('./db.json', import.meta.url));
const adapter = new JSONFile(dbFilePath);
const db = new Low(adapter, { users: [], history: [] });
await db.read();
db.data ||= { users: [], history: [] };

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

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, firstName = '', lastName = '' } = req.body || {};
  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }

  await db.read();
  const existing = db.data.users.find((u) => u.email === email);
  if (existing) {
    res.status(409).json({ message: 'User already exists with this email' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = { email, passwordHash, firstName, lastName, createdAt: nowIsoDate() };
  db.data.users.push(user);
  await db.write();

  const token = createToken(user);
  res.json({ token, user: { email: user.email, firstName: user.firstName, lastName: user.lastName } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' });
    return;
  }

  await db.read();
  const user = db.data.users.find((u) => u.email === email);
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

app.get('/api/history', authMiddleware, async (req, res) => {
  await db.read();
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

app.delete('/api/history/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  await db.read();
  const before = db.data.history.length;
  db.data.history = db.data.history.filter((h) => !(h.id === id && h.userEmail === req.user.email));
  const after = db.data.history.length;
  await db.write();
  res.json({ deleted: before - after });
});

app.delete('/api/history', authMiddleware, async (req, res) => {
  await db.read();
  db.data.history = db.data.history.filter((h) => h.userEmail !== req.user.email);
  await db.write();
  res.json({ ok: true });
});

app.listen(PORT, () => {
  process.stdout.write(`API running on http://localhost:${PORT}\n`);
});
