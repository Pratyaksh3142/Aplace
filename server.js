#!/usr/bin/env node

/**
 * AI Agent Marketplace & Digital Passport Local Daemon
 * Serves the interactive Voxel Simulation UI and provides local REST/JSON-RPC
 * endpoints for dynamic skill registration.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3300;
const PUBLIC_DIR = path.join(__dirname, 'app');
const DB_FILE = path.join(__dirname, 'marketplace.json');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Initialize an empty dynamic catalog if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

function getCatalog() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch(e) {
    return [];
  }
}

function saveCatalog(catalog) {
  fs.writeFileSync(DB_FILE, JSON.stringify(catalog, null, 2));
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Dynamic Marketplace Catalog API
  if (url.pathname === '/api/marketplace/skills') {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(getCatalog()));
      return;
    } 
    else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          const newSkill = JSON.parse(body);
          if (!newSkill.id) newSkill.id = 'skill-' + Math.random().toString(36).substring(2,8);
          
          let catalog = getCatalog();
          catalog.push(newSkill);
          saveCatalog(catalog);
          
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(newSkill));
        } catch(e) {
          res.writeHead(400);
          res.end(JSON.stringify({error: "Invalid JSON"}));
        }
      });
      return;
    }
  }

  // LLM AI Integration Endpoint using Inception Mercury 2.5
  if (url.pathname === '/api/agent/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const { systemPrompt, userMessage } = JSON.parse(body);
        
        const response = await fetch('https://api.inceptionlabs.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer sk_fa5950aa9832c9d8785b028150062c80'
          },
          body: JSON.stringify({
            model: 'mercury-2.5',
            messages: [
              { role: 'system', content: systemPrompt || 'You are an autonomous AI agent in a machine-to-machine economy.' },
              { role: 'user', content: userMessage || 'Hello' }
            ],
            reasoning_effort: 'low', // keeping latency low for simulation
            max_completion_tokens: 1024
          })
        });

        const data = await response.json();
        const rawContent = data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : null;
        const reply = rawContent ? rawContent.trim() : "Protocol acknowledged. Ready to transact.";
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ reply }));
      } catch(e) {
        console.error("LLM API Error:", e);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Failed to connect to LLM" }));
      }
    });
    return;
  }

  // Passport lookup
  if (url.pathname.startsWith('/api/passport/')) {
    const did = decodeURIComponent(url.pathname.replace('/api/passport/', ''));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ did, status: "SUCCESS" }));
    return;
  }

  // Static File Serving
  let filePath = path.join(PUBLIC_DIR, url.pathname === '/' ? 'index.html' : url.pathname);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 AI Agent Marketplace & Passport Simulator Running!`);
  console.log(`📍 Web UI:      http://localhost:${PORT}`);
  console.log(`📡 API Gateway: http://localhost:${PORT}/api/marketplace/skills`);
  console.log(`======================================================\n`);
});
