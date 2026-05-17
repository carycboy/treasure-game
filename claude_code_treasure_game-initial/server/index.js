'use strict';

const express = require('express');
const cors = require('cors');
const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = 3010;
const JWT_SECRET = process.env.JWT_SECRET || 'treasure-hunt-dev-secret';

app.use(cors());
app.use(express.json());

// Database setup using Node.js built-in sqlite (stable in Node 22.14+ / 24+)
const db = new DatabaseSync(path.join(__dirname, 'game.db'));
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch())
  );
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    score INTEGER NOT NULL,
    played_at INTEGER DEFAULT (unixepoch())
  );
`);

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

app.post('/api/auth/signup', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return res.status(400).json({ error: 'Username must be 3–20 alphanumeric characters or underscores' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const hash = bcrypt.hashSync(password, 10);
  try {
    const result = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, hash);
    const token = jwt.sign({ id: Number(result.lastInsertRowid), username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Username already taken' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/signin', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username: user.username });
});

app.post('/api/scores', authMiddleware, (req, res) => {
  const { score } = req.body || {};
  if (typeof score !== 'number') {
    return res.status(400).json({ error: 'Score must be a number' });
  }
  db.prepare('INSERT INTO scores (user_id, score) VALUES (?, ?)').run(req.user.id, score);
  res.json({ success: true });
});

app.get('/api/scores/best', authMiddleware, (req, res) => {
  const row = db.prepare('SELECT MAX(score) as best FROM scores WHERE user_id = ?').get(req.user.id);
  res.json({ best: row ? row.best : null });
});

app.listen(PORT, () => {
  console.log(`API server → http://localhost:${PORT}`);
});
