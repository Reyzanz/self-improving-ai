const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

function buildArchitecture(objective) {
  return [
    `Objective: ${objective}`,
    '',
    'Detected architecture:',
    '1. Input layer: user goals, prompts, and instructions',
    '2. Memory layer: browser persistence + structured learning notes',
    '3. Research layer: public web APIs and trend tracking',
    '4. Planner layer: upgrade roadmap and decision support',
    '5. Execution layer: task orchestration and validation hooks',
    '6. Evaluation layer: confidence scoring and iterative improvement',
    '',
    'Observations:',
    '- System can inspect itself and describe operational structure',
    '- Browser client can persist memory locally',
    '- Server-side orchestration enables real external research',
    '- Upgrade planning can be guided by evidence and trend analysis'
  ].join('\n');
}

function buildPlan(objective) {
  return [
    `Objective: ${objective}`,
    '',
    'Upgrade plan:',
    '1. Add persistent memory store with structured facts, reflection logs, and task history.',
    '2. Introduce a backend orchestrator to retrieve external research and run tool calls safely.',
    '3. Split the app into dedicated modules: researcher, planner, evaluator, executor.',
    '4. Add confidence scoring and human approval gates before high-impact changes.',
    '5. Integrate repository search and code analysis for deeper self-improvement.',
    '6. Store versioned learning snapshots and compare successive agent behaviors.',
    '7. Add a command layer for browser, terminal, or API-based automation.',
    '8. Expand the system with objective tracking, benchmarks, and success metrics.'
  ].join('\n');
}

async function fetchDuckDuckGo(query) {
  const url = `https://api.duckduckgo.com/?format=json&no_redirect=1&no_html=1&q=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`DuckDuckGo request failed: ${response.status}`);
  }
  return response.json();
}

async function fetchGitHubRepos(query) {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=5`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'self-improving-ai-app'
    }
  });
  if (!response.ok) {
    throw new Error(`GitHub request failed: ${response.status}`);
  }
  const data = await response.json();
  return data.items || [];
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, status: 'running' });
});

app.get('/api/scan', (req, res) => {
  const objective = req.query.q || 'Improve the AI to learn and evolve';
  res.json({
    objective,
    architecture: buildArchitecture(objective)
  });
});

app.get('/api/research', async (req, res) => {
  try {
    const query = req.query.q || 'self improving ai architecture';
    const ddg = await fetchDuckDuckGo(`${query} autonomous learning AI`);
    const repos = await fetchGitHubRepos(`${query} AI agent`);

    const abstract = ddg.Abstract || ddg.RelatedTopics?.[0]?.Text || 'No background summary returned by the public search service.';
    const repoList = repos.length
      ? repos.map((item) => `- ${item.full_name}: ${item.description || 'No description available.'}`).join('\n')
      : '- No matching repositories were returned by the GitHub API.';

    const payload = {
      query,
      abstract,
      repos: repoList,
      research: `Research topic: ${query}\n\nWeb insight:\n${abstract}\n\nRelated repositories:\n${repoList}`
    };

    res.json(payload);
  } catch (error) {
    res.status(500).json({
      error: 'Research failed',
      message: error.message,
      research: 'The backend could not fetch the public research data. Please verify internet access or try a different query.'
    });
  }
});

app.get('/api/plan', (req, res) => {
  const objective = req.query.q || 'Improve the AI to learn and evolve';
  res.json({
    objective,
    plan: buildPlan(objective)
  });
});

app.get('/api/cycle', async (req, res) => {
  try {
    const objective = req.query.q || 'Improve the AI to learn and evolve';
    const architecture = buildArchitecture(objective);
    const research = await fetchDuckDuckGo(`${objective} autonomous AI`);
    const repos = await fetchGitHubRepos(`${objective} AI agent`);

    const abstract = research.Abstract || 'Public research summary unavailable';
    const repoList = repos.length
      ? repos.map((item) => `- ${item.full_name}: ${item.description || 'No description'}`).join('\n')
      : '- No matching repos found';

    const plan = buildPlan(objective);
    const finalReport = [
      `Objective: ${objective}`,
      '',
      'Architecture summary:',
      architecture,
      '',
      'Research summary:',
      abstract,
      '',
      'Repository signals:',
      repoList,
      '',
      'Upgrade roadmap:',
      plan
    ].join('\n');

    res.json({
      objective,
      architecture,
      research: abstract,
      repoList,
      plan,
      finalReport
    });
  } catch (error) {
    res.status(500).json({
      error: 'Self-improvement cycle failed',
      message: error.message
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Self-Improving AI is running on http://localhost:${PORT}`);
});
