:root {
  --bg: #0b1020;
  --panel: #121a2d;
  --panel-strong: #171f36;
  --accent: #53d6ff;
  --accent-2: #a78bfa;
  --text: #e5eaf7;
  --muted: #9ba9c5;
  --good: #61e39a;
  --warn: #ffcc66;
  --danger: #ff7f7f;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  min-height: 100vh;
  font-family: Inter, "Segoe UI", sans-serif;
  background: radial-gradient(circle at top, #17213d, var(--bg) 55%);
  color: var(--text);
}

.app-shell {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 8px 0;
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--muted);
  font-size: 11px;
}

h1, h2, h3, p {
  margin-top: 0;
}

h1 {
  margin-bottom: 0;
  font-size: clamp(2rem, 3vw, 3rem);
}

.status-pill {
  padding: 10px 16px;
  border-radius: 999px;
  font-size: 0.9rem;
  background: rgba(83, 214, 255, 0.12);
  border: 1px solid rgba(83, 214, 255, 0.4);
  color: var(--accent);
}

.layout {
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  gap: 20px;
}

.panel {
  background: rgba(18, 26, 45, 0.92);
  border: 1px solid rgba(155, 169, 197, 0.14);
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 18px 40px rgba(0,0,0,0.25);
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

textarea {
  width: 100%;
  min-height: 150px;
  resize: vertical;
  border: 1px solid rgba(155, 169, 197, 0.3);
  border-radius: 12px;
  background: rgba(11, 16, 32, 0.65);
  color: var(--text);
  padding: 14px 16px;
  font: inherit;
}

.button-stack {
  display: grid;
  gap: 10px;
}

button {
  border: 1px solid rgba(83, 214, 255, 0.5);
  background: rgba(83, 214, 255, 0.08);
  color: var(--text);
  border-radius: 10px;
  padding: 12px 14px;
  font: inherit;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

button:hover {
  transform: translateY(-1px);
  border-color: rgba(83, 214, 255, 0.9);
}

button.primary {
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: #08111d;
  border: none;
  font-weight: 700;
}

.memory-list {
  list-style: none;
  padding-left: 0;
  display: grid;
  gap: 8px;
  margin: 0;
}

.memory-list li {
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(167, 139, 250, 0.08);
  border: 1px solid rgba(167, 139, 250, 0.18);
  color: var(--muted);
  font-size: 0.92rem;
}

.main-panel {
  min-height: 600px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.card {
  background: rgba(14, 21, 38, 0.7);
  border: 1px solid rgba(155, 169, 197, 0.12);
  border-radius: 16px;
  padding: 16px;
}

.full-width {
  grid-column: 1 / -1;
}

.report-box {
  min-height: 180px;
  color: var(--muted);
  line-height: 1.6;
  white-space: pre-line;
}

.report-box strong { color: var(--text); }

@media (max-width: 980px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .cards {
    grid-template-columns: 1fr;
  }
}
