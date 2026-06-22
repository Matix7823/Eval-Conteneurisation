const express = require("express");
const Redis   = require("ioredis");

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Connexion Redis ──────────────────────────────────────────────────────────
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  lazyConnect: true,
});

redis.on("connect", () => console.log("✅ Redis connecté"));
redis.on("error",   (e) => console.error("❌ Redis erreur :", e.message));

// ── Middlewares ──────────────────────────────────────────────────────────────
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }
  next();
});

// ── Routes ───────────────────────────────────────────────────────────────────

// GET /health
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "taskflow-api", env: process.env.APP_ENV || "local" });
});

// GET /tasks — liste toutes les tâches
app.get("/tasks", async (_req, res) => {
  try {
    const keys  = await redis.keys("task:*");
    const tasks = [];
    for (const key of keys) {
      const raw = await redis.get(key);
      if (raw) tasks.push(JSON.parse(raw));
    }
    tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /tasks — créer une tâche
app.post("/tasks", async (req, res) => {
  try {
    const { title, priority = "medium" } = req.body;
    if (!title || !title.trim())
      return res.status(400).json({ error: "Le champ 'title' est requis" });

    const id   = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const task = {
      id,
      title:     title.trim(),
      priority,          // low | medium | high
      done:      false,
      createdAt: new Date().toISOString(),
    };
    await redis.set(`task:${id}`, JSON.stringify(task));
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /tasks/:id — modifier (titre, priorité, done)
app.patch("/tasks/:id", async (req, res) => {
  try {
    const raw = await redis.get(`task:${req.params.id}`);
    if (!raw) return res.status(404).json({ error: "Tâche introuvable" });

    const updated = { ...JSON.parse(raw), ...req.body };
    await redis.set(`task:${req.params.id}`, JSON.stringify(updated));
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /tasks/:id — supprimer une tâche
app.delete("/tasks/:id", async (req, res) => {
  try {
    const deleted = await redis.del(`task:${req.params.id}`);
    if (!deleted) return res.status(404).json({ error: "Tâche introuvable" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /stats — statistiques stockées/mises en cache dans Redis
app.get("/stats", async (_req, res) => {
  try {
    const keys   = await redis.keys("task:*");
    const tasks  = await Promise.all(keys.map(k => redis.get(k).then(v => JSON.parse(v))));
    const total  = tasks.length;
    const done   = tasks.filter(t => t.done).length;
    const byPrio = { low: 0, medium: 0, high: 0 };
    tasks.forEach(t => { if (byPrio[t.priority] !== undefined) byPrio[t.priority]++; });

    // On met les stats en cache 30 secondes pour illustrer Redis comme cache
    const stats = { total, done, pending: total - done, byPriority: byPrio };
    await redis.setex("cache:stats", 30, JSON.stringify(stats));
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Démarrage ────────────────────────────────────────────────────────────────
async function start() {
  await redis.connect();
  app.listen(PORT, () => {
    console.log(`🚀 TaskFlow API démarrée sur le port ${PORT}`);
  });
}

start().catch(err => {
  console.error("Impossible de démarrer :", err.message);
  process.exit(1);
});
