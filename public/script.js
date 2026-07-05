/* ==========================================================
   PhotoAI — Frontend Script
   ChatGPT-style UI · Gemini AI · Multilingual · Photoshop
   ========================================================== */

(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────
  const API_BASE       = window.location.protocol === 'file:' ? 'http://localhost:3000' : '';
  let sessionId        = null;
  let isLoading        = false;
  let chatHistoryData  = JSON.parse(localStorage.getItem('photoai_history') || '[]');
  let currentChatId    = null;
  let allMessages      = [];

  // ── DOM refs ───────────────────────────────────────────
  const sidebar       = document.getElementById('sidebar');
  const menuToggle    = document.getElementById('menuToggle');
  const newChatBtn    = document.getElementById('newChatBtn');
  const clearBtn      = document.getElementById('clearBtn');
  const messageInput  = document.getElementById('messageInput');
  const sendBtn       = document.getElementById('sendBtn');
  const messages      = document.getElementById('messages');
  const welcomeScreen = document.getElementById('welcomeScreen');
  const chatContainer = document.getElementById('chatContainer');
  const chatHistory   = document.getElementById('chatHistory');
  const statusDot     = document.getElementById('statusDot');
  const statusText    = document.getElementById('statusText');
  const charCount     = document.getElementById('charCount');
  const apiBanner     = document.getElementById('apiBanner');

  // ── Init ───────────────────────────────────────────────
  async function init() {
    // Show a "Connecting…" state immediately — avoid flashing "Server Offline"
    statusDot.className  = 'status-dot connecting';
    statusText.textContent = 'PhotoAI — Connecting…';

    await createSession();
    checkHealth();          // First check, then auto-retries
    pollModelStatus();
    renderHistory();
    setupEventListeners();
    setupWelcomeCards();
  }

  // ── Create Server Session ──────────────────────────────
  async function createSession() {
    try {
      const r = await fetch(`${API_BASE}/api/session`, { method: 'POST' });
      const d = await r.json();
      sessionId = d.sessionId;
    } catch {
      sessionId = 'local-' + Date.now();
    }
  }

  // ── Health Check (with auto-retry every 10 s) ──────────
  async function checkHealth() {
    try {
      const r = await fetch(`${API_BASE}/api/health`);
      if (!r.ok) throw new Error('Non-OK response');
      const d = await r.json();

      if (d.ollama && d.ai !== 'builtin') {
        // Ollama is fully online
        const modelLabel = d.model || 'Ollama';
        statusDot.className    = 'status-dot online';
        statusText.textContent = `PhotoAI — Ready (${modelLabel})`;
        apiBanner.style.display = 'none';
      } else if (!d.ollama) {
        // Server is up but Ollama is not running — built-in mode
        statusDot.className    = 'status-dot warning';
        statusText.textContent = 'PhotoAI — Built-in Mode (Ollama Offline)';
        apiBanner.style.display = 'block';
      } else {
        // Mixed / loading state
        statusDot.className    = 'status-dot';
        statusText.textContent = 'PhotoAI — Ready';
        apiBanner.style.display = 'none';
      }
    } catch {
      // Server unreachable — show offline and retry in 10 s
      statusDot.className    = 'status-dot offline';
      statusText.textContent = 'PhotoAI — Server Offline';
    }
    // Always retry health check every 10 s so the UI auto-recovers
    setTimeout(checkHealth, 10000);
  }

  // ── Poll Model Status ──────────────────────────────────
  async function pollModelStatus() {
    const progressContainer = document.getElementById('modelProgressContainer');
    const progressTitle     = document.getElementById('modelProgressTitle');
    const progressPercent   = document.getElementById('modelProgressPercent');
    const progressBar       = document.getElementById('modelProgressBar');
    const progressDetail    = document.getElementById('modelProgressDetail');

    if (!progressContainer) return;

    try {
      const res = await fetch(`${API_BASE}/api/setup-status`);
      if (!res.ok) throw new Error('Response error');
      const data = await res.json();

      if (data.status === 'downloading') {
        progressContainer.style.display = 'block';
        progressTitle.textContent = 'Downloading Llama 3.2 8B...';
        progressPercent.textContent = `${data.percentage}%`;
        progressBar.style.width = `${data.percentage}%`;
        progressDetail.textContent = `Status: ${data.message}`;
        
        // Disable text input while downloading
        messageInput.disabled = true;
        sendBtn.disabled = true;
        messageInput.placeholder = 'Please wait while Llama 3.2 8B is downloading...';
        
        setTimeout(pollModelStatus, 2000);
      } else if (data.status === 'completed') {
        progressContainer.style.display = 'none';
        
        // Enable input
        messageInput.disabled = false;
        sendBtn.disabled = false;
        messageInput.placeholder = 'Ask anything about Photoshop... · বাংলায় লিখুন · Any language...';
        
        statusDot.className = 'status-dot';
        statusText.textContent = 'PhotoAI — Ready (Ollama Llama 3.2)';
      } else if (data.status === 'offline') {
        progressContainer.style.display = 'none';
        statusDot.className = 'status-dot offline';
        statusText.textContent = 'PhotoAI — Ollama Offline';
        apiBanner.style.display = 'block';
        
        messageInput.disabled = false;
        sendBtn.disabled = false;
      } else if (data.status === 'error') {
        progressContainer.style.display = 'block';
        progressTitle.textContent = 'Setup Error';
        progressPercent.textContent = 'Err';
        progressBar.style.width = '0%';
        progressDetail.textContent = data.message;
        
        messageInput.disabled = false;
        sendBtn.disabled = false;
      } else {
        // Idle or other states
        setTimeout(pollModelStatus, 3000);
      }
    } catch (e) {
      console.error('Failed to poll status:', e);
      setTimeout(pollModelStatus, 5000);
    }
  }

  // ── Event Listeners ────────────────────────────────────
  function setupEventListeners() {
    // Send on button click
    sendBtn.addEventListener('click', handleSend);

    // Send on Enter (Shift+Enter = newline)
    messageInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });

    // Auto-resize textarea
    messageInput.addEventListener('input', () => {
      autoResize();
      updateCharCount();
    });

    // Sidebar toggle
    menuToggle.addEventListener('click', toggleSidebar);

    // New chat
    newChatBtn.addEventListener('click', startNewChat);
    clearBtn.addEventListener('click', clearCurrentChat);

    // Click on history items or delete buttons
    chatHistory.addEventListener('click', e => {
      const deleteBtn = e.target.closest('.history-delete-btn');
      const historyItem = e.target.closest('.history-item');

      if (deleteBtn) {
        e.stopPropagation();
        const chatId = deleteBtn.getAttribute('data-id');
        deleteChat(chatId);
        return;
      }

      if (historyItem) {
        const chatId = historyItem.getAttribute('data-id');
        loadChat(chatId);
      }
    });

    // Mobile overlay
    const overlay = createOverlay();
    overlay.addEventListener('click', closeSidebar);
  }

  // ── Welcome Cards ──────────────────────────────────────
  function setupWelcomeCards() {
    document.querySelectorAll('.welcome-card').forEach(card => {
      card.addEventListener('click', () => {
        const prompt = card.getAttribute('data-prompt');
        if (prompt) {
          messageInput.value = prompt;
          autoResize();
          updateCharCount();
          handleSend();
        }
      });
    });
  }

  // ── Send Message ───────────────────────────────────────
  async function handleSend() {
    const text = messageInput.value.trim();
    if (!text || isLoading) return;

    // Hide welcome, show messages
    if (welcomeScreen.style.display !== 'none' || !welcomeScreen.classList.contains('hidden')) {
      welcomeScreen.style.display = 'none';
    }

    // Add to history if new chat
    if (!currentChatId) {
      currentChatId = Date.now().toString();
      const summary = text.length > 40 ? text.substring(0, 40) + '…' : text;
      chatHistoryData.unshift({ id: currentChatId, title: summary, time: Date.now() });
      if (chatHistoryData.length > 30) chatHistoryData = chatHistoryData.slice(0, 30);
      saveChatHistory();
      renderHistory();
    }

    // Clear input
    messageInput.value = '';
    autoResize();
    updateCharCount();

    // Append user message
    const msgTime = new Date().toISOString();
    appendMessage('user', text, msgTime);
    allMessages.push({ role: 'user', content: text, timestamp: msgTime });
    saveCurrentChatState();

    // Show typing
    setLoading(true);
    const typingEl = showTyping();

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method  : 'POST',
        headers : { 'Content-Type': 'application/json' },
        body    : JSON.stringify({ message: text, sessionId })
      });

      const data = await response.json();
      removeTyping(typingEl);
      setLoading(false);

      if (data.error === 'API_KEY_MISSING') {
        appendMessage('ai', '⚠️ **API Key Missing!**\n\nPlease add your Gemini API key to the `.env` file.\n\n👉 Get a **FREE** key at: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)\n\n1. Open `.env` file in the AI folder\n2. Replace `YOUR_GEMINI_API_KEY_HERE` with your key\n3. Restart the server with `npm start`\n\nআপনার Gemini API key `.env` ফাইলে যোগ করুন এবং server restart করুন।');
        apiBanner.style.display = 'block';
        return;
      }

      if (!response.ok || data.error) {
        throw new Error(data.message || 'Server error');
      }

      const aiMsgTime = data.timestamp || new Date().toISOString();
      const aiSource  = data.source || 'builtin';
      const aiModel   = data.model  || 'built-in';
      allMessages.push({ role: 'assistant', content: data.reply, timestamp: aiMsgTime, source: aiSource, model: aiModel });
      saveCurrentChatState();
      appendMessage('ai', data.reply, aiMsgTime, aiSource, aiModel);

    } catch (err) {
      removeTyping(typingEl);
      setLoading(false);
      console.error('Chat error:', err);
      appendMessage('ai', '❌ **Connection Error**\n\nCould not reach the server. Please make sure the server is running.\n\n```\nnpm start\n```\n\nসার্ভার চালু করুন এবং আবার চেষ্টা করুন।');
    }
  }

  // ── Append Message ─────────────────────────────────────
  function appendMessage(role, content, timestamp, source, model) {
    const msgEl = document.createElement('div');
    msgEl.className = `message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'user' ? '👤' : '🎨';

    const body = document.createElement('div');
    body.className = 'message-body';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';

    if (role === 'ai') {
      bubble.innerHTML = renderMarkdown(content);
    } else {
      bubble.textContent = content;
    }

    const meta = document.createElement('div');
    meta.className = 'message-meta';

    const time = formatMessageTimestamp(timestamp);
    meta.innerHTML = `<span>${time}</span>`;

    // AI source badge — shows whether Ollama or Built-in engine replied
    if (role === 'ai' && source) {
      const badge = document.createElement('span');
      badge.className = source === 'ollama' ? 'ai-badge ollama' : 'ai-badge builtin';
      badge.textContent = source === 'ollama' ? `⚡ ${model}` : '📚 Built-in';
      badge.title = source === 'ollama'
        ? `Response generated by Ollama (${model}) running on server`
        : 'Response from built-in offline knowledge base';
      meta.appendChild(badge);
    }

    if (role === 'ai') {
      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-btn';
      copyBtn.innerHTML = '📋 Copy';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(content).then(() => {
          copyBtn.innerHTML = '✅ Copied!';
          setTimeout(() => copyBtn.innerHTML = '📋 Copy', 2000);
        });
      });
      meta.appendChild(copyBtn);
    }

    body.appendChild(bubble);
    body.appendChild(meta);
    msgEl.appendChild(avatar);
    msgEl.appendChild(body);
    messages.appendChild(msgEl);
    scrollToBottom();
  }

  // ── Typing Indicator ───────────────────────────────────
  function showTyping() {
    const el = document.createElement('div');
    el.className = 'message ai typing-indicator';
    el.id = 'typingEl';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = '🎨';

    const dots = document.createElement('div');
    dots.className = 'typing-dots';
    dots.innerHTML = '<span></span><span></span><span></span>';

    el.appendChild(avatar);
    el.appendChild(dots);
    messages.appendChild(el);
    scrollToBottom();
    return el;
  }

  function removeTyping(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  // ── Markdown Renderer ──────────────────────────────────
  function renderMarkdown(text) {
    // Escape HTML first
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks (```)
    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
      `<pre><code class="lang-${lang}">${code.trim()}</code></pre>`
    );

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm,  '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm,   '<h1>$1</h1>');

    // Bold & Italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g,     '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g,         '<em>$1</em>');
    html = html.replace(/__(.+?)__/g,         '<strong>$1</strong>');
    html = html.replace(/_(.+?)_/g,           '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#c084fc">$1</a>'
    );

    // Horizontal rule
    html = html.replace(/^---+$/gm, '<hr>');

    // Blockquotes
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

    // Unordered lists
    html = html.replace(/^\s*[-*+] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Ordered lists
    html = html.replace(/^\s*\d+\. (.+)$/gm, '<li>$1</li>');

    // Line breaks → paragraphs
    const parts = html.split(/\n\n+/);
    html = parts.map(p => {
      p = p.trim();
      if (!p) return '';
      if (/^<(h[123]|ul|ol|li|blockquote|pre|hr)/.test(p)) return p;
      return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');

    return html;
  }

  // ── New Chat ───────────────────────────────────────────
  function startNewChat() {
    currentChatId = null;
    allMessages   = [];
    messages.innerHTML = '';
    welcomeScreen.style.display = '';
    messageInput.value = '';
    autoResize();
    createSession();
    document.querySelectorAll('.history-item').forEach(el => el.classList.remove('active'));
    closeSidebar();
  }

  // ── Clear Chat ─────────────────────────────────────────
  function clearCurrentChat() {
    if (!confirm('Clear this conversation?')) return;
    allMessages = [];
    messages.innerHTML = '';
    welcomeScreen.style.display = '';
    if (sessionId) {
      fetch(`${API_BASE}/api/session/${sessionId}`, { method: 'DELETE' }).catch(() => {});
    }
    createSession();
    currentChatId = null;
  }

  // ── Sidebar ────────────────────────────────────────────
  function toggleSidebar() {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      sidebar.classList.toggle('open');
      document.querySelector('.sidebar-overlay').classList.toggle('visible');
    } else {
      sidebar.classList.toggle('collapsed');
    }
  }

  function closeSidebar() {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      sidebar.classList.remove('open');
      document.querySelector('.sidebar-overlay').classList.remove('visible');
    }
  }

  function createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    return overlay;
  }

  // ── Chat History (localStorage) ───────────────────────
  function saveChatHistory() {
    localStorage.setItem('photoai_history', JSON.stringify(chatHistoryData));
  }

  function saveCurrentChatState() {
    if (!currentChatId) return;
    localStorage.setItem(`photoai_chat_${currentChatId}`, JSON.stringify({
      sessionId,
      messages: allMessages
    }));
  }

  function loadChat(chatId) {
    const raw = localStorage.getItem(`photoai_chat_${chatId}`);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      currentChatId = chatId;
      sessionId = data.sessionId;
      allMessages = data.messages || [];

      // Clear UI
      messages.innerHTML = '';
      welcomeScreen.style.display = 'none';

      // Load messages
      allMessages.forEach(msg => {
        appendMessage(msg.role === 'assistant' ? 'ai' : 'user', msg.content, msg.timestamp);
      });

      renderHistory();
      scrollToBottom();
    } catch (e) {
      console.error('Failed to load chat:', e);
    }
  }

  function deleteChat(chatId) {
    if (!confirm('Are you sure you want to delete this chat?')) return;
    
    // Filter index
    chatHistoryData = chatHistoryData.filter(item => item.id !== chatId);
    saveChatHistory();
    
    // Delete session from server if possible
    const raw = localStorage.getItem(`photoai_chat_${chatId}`);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (data.sessionId) {
          fetch(`${API_BASE}/api/session/${data.sessionId}`, { method: 'DELETE' }).catch(() => {});
        }
      } catch (e) {}
    }

    localStorage.removeItem(`photoai_chat_${chatId}`);

    if (currentChatId === chatId) {
      startNewChat();
    } else {
      renderHistory();
    }
  }

  function formatTimeAgo(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  function formatMessageTimestamp(timestamp) {
    const date = timestamp ? new Date(timestamp) : new Date();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${timeStr}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${timeStr}`;
    } else {
      const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      return `${dateStr} at ${timeStr}`;
    }
  }

  function renderHistory() {
    if (!chatHistoryData.length) {
      chatHistory.innerHTML = '<div class="history-empty">No chats yet.<br>Start a conversation!</div>';
      return;
    }
    chatHistory.innerHTML = chatHistoryData.map(item => `
      <div class="history-item ${item.id === currentChatId ? 'active' : ''}" data-id="${item.id}">
        <span class="chat-icon">💬</span>
        <div class="history-info">
          <div class="history-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</div>
          <div class="history-time">${formatTimeAgo(item.time)}</div>
        </div>
        <button class="history-delete-btn" title="Delete Chat" data-id="${item.id}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>
    `).join('');
  }

  // ── Helpers ────────────────────────────────────────────
  function setLoading(state) {
    isLoading = state;
    sendBtn.disabled = state;
    messageInput.disabled = state;
  }

  function autoResize() {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 180) + 'px';
  }

  function updateCharCount() {
    const len = messageInput.value.length;
    charCount.textContent = `${len} / 4000`;
    charCount.style.color = len > 3500 ? '#ef4444' : len > 3000 ? '#f59e0b' : '';
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    });
  }

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Start ──────────────────────────────────────────────
  init();

})();
