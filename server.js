// Daruma Pet Shop - Leaderboard API
// Simple Express server storing scores in a JSON file.
// Deploy this on Render.com the same way as your LINE OA CRM bot.

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'scores.json');
const ADMIN_KEY = process.env.ADMIN_KEY || 'daruma-admin-2026'; // change this in Render env vars!

function loadScores() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function saveScores(scores) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(scores, null, 2));
}

// Health check
app.get('/', (req, res) => {
  res.json({ ok: true, service: 'daruma-leaderboard' });
});

// Submit a score
// body: { name: string, score: number, character: "dog"|"cat", lineUserId?: string }
app.post('/api/score', (req, res) => {
  const { name, score, character, lineUserId } = req.body || {};

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'name is required' });
  }
  if (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 100000) {
    return res.status(400).json({ error: 'invalid score' });
  }

  const scores = loadScores();
  const entry = {
    id: Date.now() + '-' + Math.random().toString(36).slice(2, 8),
    name: name.trim().slice(0, 40),
    score: Math.floor(score),
    character: character === 'cat' ? 'cat' : 'dog',
    lineUserId: lineUserId ? String(lineUserId).slice(0, 100) : null,
    createdAt: new Date().toISOString()
  };
  scores.push(entry);
  saveScores(scores);

  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const rank = sorted.findIndex(s => s.id === entry.id) + 1;

  res.json({ ok: true, rank, totalPlayers: scores.length });
});

// Get top scores
// query: ?limit=10
app.get('/api/leaderboard', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const scores = loadScores();

  // Keep only each player's best score (by name, case-insensitive)
  const bestByName = new Map();
  for (const s of scores) {
    const key = s.name.toLowerCase();
    if (!bestByName.has(key) || bestByName.get(key).score < s.score) {
      bestByName.set(key, s);
    }
  }

  const top = [...bestByName.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s, i) => ({
      rank: i + 1,
      name: s.name,
      score: s.score,
      character: s.character,
      createdAt: s.createdAt
    }));

  res.json({ leaderboard: top });
});

// Admin: full raw list (for picking prize winners, verifying entries)
// header: x-admin-key
app.get('/api/admin/all-scores', (req, res) => {
  if (req.headers['x-admin-key'] !== ADMIN_KEY) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const scores = loadScores().sort((a, b) => b.score - a.score);
  res.json({ scores, count: scores.length });
});

// Admin: reset leaderboard (e.g. start a new campaign)
// header: x-admin-key
app.post('/api/admin/reset', (req, res) => {
  if (req.headers['x-admin-key'] !== ADMIN_KEY) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  saveScores([]);
  res.json({ ok: true, message: 'leaderboard reset' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Leaderboard API running on port ${PORT}`);
});
