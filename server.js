// ============================================================
//  PhotoAI Server v3.1 — Ollama Auto-Installer + Built-in AI
//  Node.js + Express · Adobe Photoshop Expert
//  Adobe Photoshop Expert (PS 1.0 → 2025) · Bangla + English
// ============================================================

require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const fetch     = require('node-fetch');
const path      = require('path');
const { v4: uuidv4 } = require('uuid');
const { generateResponse, detectLanguage } = require('./knowledge/ai-engine');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Safety: prevent stray async errors from crashing the server ──
process.on('unhandledRejection', (reason) => {
  console.error('[Server] Unhandled rejection (server kept alive):', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught exception (server kept alive):', err.message);
});

// ── Ollama Config ──────────────────────────────────────────
const OLLAMA_HOST  = process.env.OLLAMA_HOST  || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1'; // Defaults to llama3.1 (8B) as requested for 8B model

// ── Model Download Status Tracker ─────────────────────────
let downloadProgress = {
  status: 'idle', // 'idle', 'downloading', 'completed', 'error'
  percentage: 0,
  message: 'Initializing...'
};

// ── Middleware ─────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const limiter = rateLimit({ windowMs: 60 * 1000, max: 120,
  message: { error: 'Too many requests. Please slow down.' }
});
app.use('/api/', limiter);

// ── Sessions ───────────────────────────────────────────────
const sessions = new Map();

// ── System Prompt ──────────────────────────────────────────
const SYSTEM_PROMPT = `You are PhotoAI — an expert Adobe Photoshop assistant by SB Studio.
You have complete knowledge of every Photoshop version from 1.0 (1990) to 2025.
You are fluent in Bengali (Bangla) and English. If the user writes in Bangla, reply in Bangla.
If they write in English, reply in English.
Give detailed, step-by-step answers about Photoshop.
You can also answer general questions.`;

// ── Check if Ollama is reachable ───────────────────────────
async function isOllamaAvailable() {
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/tags`, { timeout: 3000 });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Ollama Auto-Downloader / Background Pull ──────────────
async function pullModel(modelName) {
  try {
    downloadProgress.status = 'downloading';
    downloadProgress.percentage = 0;
    downloadProgress.message = `Connecting to pull ${modelName}...`;

    console.log(`[Ollama] Pulling model ${modelName}...`);

    const res = await fetch(`${OLLAMA_HOST}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName, stream: true })
    });

    if (!res.ok) {
      throw new Error(`Ollama responded with status: ${res.status}`);
    }

    // Read the stream chunk by chunk
    res.body.on('data', chunk => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          if (json.status) {
            downloadProgress.message = json.status;
          }
          if (json.completed && json.total) {
            downloadProgress.percentage = Math.round((json.completed / json.total) * 100);
            downloadProgress.message = `${json.status} (${downloadProgress.percentage}%)`;
          }
        } catch (e) {
          // ignore incomplete lines / parsing failures
        }
      }
    });

    res.body.on('end', () => {
      downloadProgress.status = 'completed';
      downloadProgress.percentage = 100;
      downloadProgress.message = 'Model is ready.';
      console.log(`[Ollama] ✅ Model ${modelName} downloaded and loaded successfully.`);
    });

    res.body.on('error', err => {
      downloadProgress.status = 'error';
      downloadProgress.message = `Stream error: ${err.message}`;
      console.error(`[Ollama] ❌ Stream error while pulling ${modelName}:`, err.message);
    });

  } catch (err) {
    downloadProgress.status = 'error';
    downloadProgress.message = `Download failed: ${err.message}`;
    console.error(`[Ollama] ❌ Error downloading model ${modelName}:`, err.message);
  }
}

async function checkAndPullModel() {
  try {
    const isAvailable = await isOllamaAvailable();
    if (!isAvailable) {
      downloadProgress.status = 'offline';
      downloadProgress.message = 'Ollama is not running.';
      return;
    }

    // Check if model exists locally
    const res = await fetch(`${OLLAMA_HOST}/api/tags`);
    if (!res.ok) throw new Error('Failed to get tags');
    const data = await res.json();
    const models = data.models || [];
    const exists = models.some(m => m.name.startsWith(OLLAMA_MODEL));

    if (exists) {
      downloadProgress.status = 'completed';
      downloadProgress.percentage = 100;
      downloadProgress.message = 'Model is ready.';
      console.log(`[Ollama] ✅ Model ${OLLAMA_MODEL} is already installed.`);
    } else {
      console.log(`[Ollama] Model ${OLLAMA_MODEL} not found. Launching auto-download...`);
      pullModel(OLLAMA_MODEL);
    }
  } catch (err) {
    downloadProgress.status = 'error';
    downloadProgress.message = `Setup check failed: ${err.message}`;
    console.error(`[Ollama] ❌ Setup check failed:`, err.message);
  }
}

// ── Ollama API Call ────────────────────────────────────────
async function callOllama(history) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map(m => ({ role: m.role, content: m.content }))
  ];

  const res = await fetch(`${OLLAMA_HOST}/api/chat`, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({
      model   : OLLAMA_MODEL,
      messages,
      stream  : false,
      options : {
        temperature : 0.8,
        num_predict : 2048,
        top_p       : 0.9
      }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Ollama ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.message?.content || data.response || '';
}

// ── Routes ─────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/session', (req, res) => {
  const sessionId = uuidv4();
  sessions.set(sessionId, []);
  res.json({ sessionId });
});

app.get('/api/setup-status', async (req, res) => {
  const ollamaUp = await isOllamaAvailable();
  if (!ollamaUp) {
    return res.json({
      status: 'offline',
      message: 'Ollama is not running. Please start Ollama.'
    });
  }
  res.json({
    status: downloadProgress.status,
    percentage: downloadProgress.percentage,
    message: downloadProgress.message
  });
});

app.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }
  if (message.length > 4000) {
    return res.status(400).json({ error: 'Message too long.' });
  }

  let history = sessions.get(sessionId) || [];
  history.push({ role: 'user', content: message.trim() });
  if (history.length > 40) history = history.slice(-40);

  let reply;
  let source = 'builtin';

  // Try Ollama first
  try {
    const ollamaUp = await isOllamaAvailable();
    if (ollamaUp && downloadProgress.status === 'completed') {
      reply  = await callOllama(history);
      source = 'ollama';
    } else {
      throw new Error('Ollama model not fully loaded or Ollama offline');
    }
  } catch (err) {
    console.log('Ollama unavailable or loading, using built-in AI:', err.message);
    reply  = generateResponse(message.trim());
    source = 'builtin';
  }

  history.push({ role: 'assistant', content: reply });
  sessions.set(sessionId, history);

  return res.json({
    reply,
    sessionId : sessionId || uuidv4(),
    source,
    model     : source === 'ollama' ? OLLAMA_MODEL : 'built-in',
    timestamp : new Date().toISOString()
  });
});

app.delete('/api/session/:id', (req, res) => {
  sessions.delete(req.params.id);
  res.json({ success: true });
});

app.get('/api/health', async (req, res) => {
  const ollamaUp = await isOllamaAvailable();
  res.json({
    status      : 'ok',
    ai          : (ollamaUp && downloadProgress.status === 'completed') ? 'ollama+builtin' : 'builtin',
    mode        : (ollamaUp && downloadProgress.status === 'completed') ? `Ollama (${OLLAMA_MODEL}) + Built-in` : 'Built-in Offline AI',
    ollama      : ollamaUp,
    model       : OLLAMA_MODEL,
    setupStatus : downloadProgress.status,
    ps_knowledge: 'PS 1.0 (1990) → PS 2025',
    languages   : ['Bengali (Bangla)', 'English', 'All languages'],
    version     : '3.1.0',
    uptime      : Math.floor(process.uptime()) + 's'
  });
});

// ── Start ──────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║   🎨  PhotoAI v3.1 — SB Studio           ║');
  console.log(`  ║   🚀  http://localhost:${PORT}              ║`);
  console.log('  ║   🌍  Bangla + English + All Languages   ║');
  console.log('  ║   📸  Adobe Photoshop PS 1.0 → PS 2025   ║');
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');
  
  // Trigger background setup check & auto pull
  await checkAndPullModel();

  console.log('  ✅  Server is READY — open http://localhost:' + PORT);
  console.log('');
});
