require('dotenv').config();

const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const PORT = process.env.PORT || 5000;

// ---------------------------------------------------------------------------
// Database setup (better-sqlite3, single file, zero config).
// The file projects.db is created automatically on first run.
// ---------------------------------------------------------------------------
const db = new Database('projects.db');
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    budget INTEGER,
    start_date TEXT,
    deadline TEXT,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
const app = express();
app.use(cors());
app.use(express.json());

// Allowed enum values (kept simple, validated on write).
const REQUIRED_FIELDS = ['name', 'category', 'status', 'priority', 'deadline'];

function missingFields(body) {
  return REQUIRED_FIELDS.filter((f) => {
    const v = body[f];
    return v === undefined || v === null || String(v).trim() === '';
  });
}

// Normalise an incoming body into the columns we store.
function buildRecord(body) {
  return {
    name: body.name,
    category: body.category,
    status: body.status,
    priority: body.priority,
    progress: Number.isFinite(parseInt(body.progress, 10)) ? parseInt(body.progress, 10) : 0,
    budget: body.budget === '' || body.budget === undefined || body.budget === null
      ? null
      : parseInt(body.budget, 10),
    start_date: body.start_date || null,
    deadline: body.deadline,
    description: body.description || null,
  };
}

// ---------------------------------------------------------------------------
// Routes: /api/projects
// ---------------------------------------------------------------------------

// List all (newest first)
app.get('/api/projects', (req, res) => {
  try {
    const rows = db
      .prepare('SELECT * FROM projects ORDER BY datetime(created_at) DESC, id DESC')
      .all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get one
app.get('/api/projects/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Project not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create
app.post('/api/projects', (req, res) => {
  try {
    const missing = missingFields(req.body);
    if (missing.length) {
      return res
        .status(400)
        .json({ error: `Missing required fields: ${missing.join(', ')}` });
    }

    const r = buildRecord(req.body);
    const info = db
      .prepare(
        `INSERT INTO projects
          (name, category, status, priority, progress, budget, start_date, deadline, description)
         VALUES
          (@name, @category, @status, @priority, @progress, @budget, @start_date, @deadline, @description)`
      )
      .run(r);

    const created = db.prepare('SELECT * FROM projects WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
app.put('/api/projects/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Project not found' });

    const missing = missingFields(req.body);
    if (missing.length) {
      return res
        .status(400)
        .json({ error: `Missing required fields: ${missing.join(', ')}` });
    }

    const r = buildRecord(req.body);
    db.prepare(
      `UPDATE projects SET
         name=@name, category=@category, status=@status, priority=@priority,
         progress=@progress, budget=@budget, start_date=@start_date,
         deadline=@deadline, description=@description
       WHERE id=@id`
    ).run({ ...r, id: req.params.id });

    const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
app.delete('/api/projects/:id', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Stats: /api/stats
// ---------------------------------------------------------------------------
app.get('/api/stats', (req, res) => {
  try {
    const totalProjects = db.prepare('SELECT COUNT(*) AS c FROM projects').get().c;

    const statusRows = db
      .prepare('SELECT status, COUNT(*) AS count FROM projects GROUP BY status')
      .all();
    const categoryRows = db
      .prepare('SELECT category, COUNT(*) AS count FROM projects GROUP BY category')
      .all();

    const statusCounts = {};
    statusRows.forEach((r) => (statusCounts[r.status] = r.count));

    const categoryCounts = {};
    categoryRows.forEach((r) => (categoryCounts[r.category] = r.count));

    const agg = db
      .prepare('SELECT SUM(budget) AS totalBudget, AVG(progress) AS avgProgress FROM projects')
      .get();

    res.json({
      totalProjects,
      statusCounts,
      categoryCounts,
      totalBudget: agg.totalBudget || 0,
      avgProgress: agg.avgProgress ? Math.round(agg.avgProgress) : 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Project Tracker API running on http://localhost:${PORT}`);
});
