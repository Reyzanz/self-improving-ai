const chatBox = document.getElementById('chatBox');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const quickLearnInput = document.getElementById('quickLearnInput');
const quickLearnBtn = document.getElementById('quickLearnBtn');
const statusPill = document.getElementById('statusPill');

const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

const objectiveInput = document.getElementById('objectiveInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const architectureReport = document.getElementById('architectureReport');
const learningHistory = document.getElementById('learningHistory');
const refreshLearningBtn = document.getElementById('refreshLearningBtn');
const generatePlanBtn = document.getElementById('generatePlanBtn');
const upgradePlan = document.getElementById('upgradePlan');

// Tab switching
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanes.forEach(p => p.classList.remove('active'));
    
    btn.classList.add('active');
    const tabName = btn.getAttribute('data-tab');
    document.getElementById(`${tabName}-tab`).classList.add('active');
  });
});

// Chat functions
function addChatMessage(message, role = 'user') {
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-message ${role}`;
  msgDiv.innerHTML = `<p>${escapeHtml(message)}</p>`;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function setStatus(text, tone = 'normal') {
  statusPill.textContent = text;
  statusPill.style.color = tone === 'good' ? '#61e39a' : tone === 'warn' ? '#ffcc66' : '#53d6ff';
  statusPill.style.borderColor = tone === 'good' ? 'rgba(97,227,154,0.5)' : tone === 'warn' ? 'rgba(255,204,102,0.5)' : 'rgba(83,214,255,0.4)';
}

sendBtn.addEventListener('click', async () => {
  const message = chatInput.value.trim();
  if (!message) return;

  addChatMessage(message, 'user');
  chatInput.value = '';
  setStatus('Thinking...', 'warn');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);
    
    const data = await response.json();
    addChatMessage(data.message, 'ai');
    
    if (data.learned) {
      setStatus('✅ Sudah belajar!', 'good');
    } else {
      setStatus('Siap', 'good');
    }
  } catch (error) {
    addChatMessage(`Error: ${error.message}`, 'ai');
    setStatus('Error', 'warn');
  }
});

chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendBtn.click();
  }
});

quickLearnBtn.addEventListener('click', async () => {
  const topic = quickLearnInput.value.trim();
  if (!topic) return;

  setStatus('📚 Sedang belajar...', 'warn');
  
  try {
    const response = await fetch('/api/learn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic })
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);
    
    const data = await response.json();
    addChatMessage(`Saya sudah belajar tentang "${topic}". ${data.analysis}`, 'ai');
    quickLearnInput.value = '';
    
    setStatus('✅ Learning complete!', 'good');
    refreshLearningHistory();
  } catch (error) {
    addChatMessage(`Error learning: ${error.message}`, 'ai');
    setStatus('Error', 'warn');
  }
});

async function refreshLearningHistory() {
  try {
    const response = await fetch('/api/learning-history');
    const data = await response.json();
    
    learningHistory.innerHTML = '';
    if (data.history.length === 0) {
      learningHistory.innerHTML = '<p>Belum ada pembelajaran...</p>';
      return;
    }

    data.history.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'learning-item';
      itemDiv.innerHTML = `
        <div class="learning-item-title">📖 ${escapeHtml(item.topic)}</div>
        <div class="learning-item-content">${escapeHtml(item.content.substring(0, 100))}...</div>
        <small>${new Date(item.learned_at).toLocaleString('id-ID')}</small>
      `;
      learningHistory.appendChild(itemDiv);
    });
  } catch (error) {
    learningHistory.innerHTML = `<p>Error: ${error.message}</p>`;
  }
}

analyzeBtn.addEventListener('click', async () => {
  const objective = objectiveInput.value.trim();
  if (!objective) return;

  setStatus('Analyzing...', 'warn');
  architectureReport.textContent = '🔄 Menganalisis arsitektur...\n\n' + objective;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: `Analisis objective ini dan jelaskan arsitektur yang diperlukan: "${objective}"` 
      })
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);
    
    const data = await response.json();
    architectureReport.textContent = `OBJECTIVE:\n${objective}\n\nARSITEKTUR ANALISIS:\n${data.message}`;
    
    setStatus('✅ Analysis complete', 'good');
  } catch (error) {
    architectureReport.textContent = `Error: ${error.message}`;
    setStatus('Error', 'warn');
  }
});

generatePlanBtn.addEventListener('click', async () => {
  const objective = objectiveInput.value.trim() || 'Improve AI';
  
  setStatus('Generating plan...', 'warn');
  upgradePlan.textContent = '🔄 Membuat rencana upgrade...\n\nObjective: ' + objective;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: `Buat rencana upgrade detail untuk: "${objective}". Berikan 8 langkah konkret dengan prioritas.` 
      })
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);
    
    const data = await response.json();
    upgradePlan.textContent = `OBJECTIVE:\n${objective}\n\nRENCANA UPGRADE:\n${data.message}`;
    
    setStatus('✅ Plan ready', 'good');
  } catch (error) {
    upgradePlan.textContent = `Error: ${error.message}`;
    setStatus('Error', 'warn');
  }
});

refreshLearningBtn.addEventListener('click', refreshLearningHistory);

// Load data on startup
window.addEventListener('load', () => {
  setStatus('Siap', 'good');
  refreshLearningHistory();
  addChatMessage('Halo! Saya AI yang sedang belajar. Bagaimana saya bisa membantu Anda hari ini?', 'ai');
});
