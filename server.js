require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const sqlite3 = require('sqlite3').verbose();
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup
const db = new sqlite3.Database(path.join(__dirname, 'ai-memory.db'), (err) => {
  if (err) console.error('Database error:', err);
  else console.log('Database connected');
  initDatabase();
});

function initDatabase() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS learning_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic TEXT,
        content TEXT,
        source TEXT,
        learned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        category TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT,
        message TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS improvement_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        objective TEXT,
        improvement_plan TEXT,
        status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  });
}

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Helper functions
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function fetchDuckDuckGo(query) {
  try {
    const url = `http://api.duckduckgo.com/?format=json&no_redirect=1&no_html=1&q=${encodeURIComponent(query)}`;
    return await makeRequest(url);
  } catch (error) {
    return { Abstract: 'Pencarian tidak tersedia' };
  }
}

function addToLearningHistory(topic, content, source = 'user', category = 'general') {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO learning_history (topic, content, source, category) VALUES (?, ?, ?, ?)`,
      [topic, content, source, category],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

function getLearningHistory(limit = 10) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM learning_history ORDER BY learned_at DESC LIMIT ?`,
      [limit],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
}

function saveChatHistory(role, message) {
  db.run(
    `INSERT INTO chat_history (role, message) VALUES (?, ?)`,
    [role, message]
  );
}

// API Endpoints
app.post('/api/chat', async (req, res) => {
  try {
    const userMessage = req.body.message || '';
    
    saveChatHistory('user', userMessage);

    // Get learning history context
    const learningHistory = await getLearningHistory(5);
    const historyContext = learningHistory
      .map(l => `${l.topic}: ${l.content}`)
      .join('\n');

    const systemPrompt = `Anda adalah AI yang sedang belajar dan berkembang. Anda bisa:
1. Mempelajari topik baru (user suruh "Pelajari tentang X")
2. Menganalisis kode dan arsitektur
3. Membuat rencana upgrade
4. Menjawab pertanyaan sesuai apa yang sudah dipelajari

Pembelajaran sebelumnya:
${historyContext || 'Belum ada pembelajaran sebelumnya'}

Gunakan bahasa Indonesia yang natural dan membantu. Jika user minta mempelajari sesuatu, ekstrak informasi penting dan simpan.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const assistantMessage = response.choices[0].message.content;
    saveChatHistory('assistant', assistantMessage);

    // Check if user asked to learn something
    if (userMessage.toLowerCase().includes('pelajari') || userMessage.toLowerCase().includes('learn')) {
      const topic = userMessage.replace(/pelajari|learn/gi, '').trim();
      const research = await fetchDuckDuckGo(topic);
      const abstract = research.Abstract || 'Tidak ada ringkasan tersedia';
      
      await addToLearningHistory(
        topic,
        abstract,
        'web_research',
        'learning'
      );
    }

    res.json({
      message: assistantMessage,
      learned: userMessage.toLowerCase().includes('pelajari')
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Chat failed',
      message: error.message
    });
  }
});

app.get('/api/learning-history', async (req, res) => {
  try {
    const history = await getLearningHistory(20);
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/learn', async (req, res) => {
  try {
    const topic = req.body.topic || '';
    const research = await fetchDuckDuckGo(topic);
    const abstract = research.Abstract || 'Tidak ada ringkasan';

    await addToLearningHistory(
      topic,
      abstract,
      'user_request',
      'learning'
    );

    // Get AI analysis
    const analysis = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `Anda telah belajar tentang "${topic}". Ringkasan: ${abstract}\n\nBerikan analisis singkat dalam bahasa Indonesia tentang topik ini dan bagaimana bisa digunakan untuk upgrade sistem AI.`
        }
      ],
      max_tokens: 500
    });

    const aiAnalysis = analysis.choices[0].message.content;

    res.json({
      topic,
      summary: abstract,
      analysis: aiAnalysis,
      learned: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, status: 'running', openaiConnected: !!process.env.OPENAI_API_KEY });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 Self-Improving AI v2.0 running on http://localhost:${PORT}`);
  console.log(`📚 Learning database: ai-memory.db`);
  console.log(`🤖 OpenAI API: ${process.env.OPENAI_API_KEY ? '✅ Connected' : '❌ Not configured'}\n`);
});
