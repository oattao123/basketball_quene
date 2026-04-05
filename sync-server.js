const http = require('http');
const { WebSocketServer } = require('ws');
const fs = require('fs');
const path = require('path');

const PORT = 3333;

// ===== Shared State =====
let sharedState = {
  teams: [],
  currentlyPlaying: [],
  winStreak: {},
  restingTeams: [],
  gameMode: 'rest',
  scores: {},
  showScoring: false,
  scoringMode: '3x3',
  timerDuration: 10,
  timeLeft: 0,
  isTimerRunning: false,
};

// Track connected clients
let clients = new Set();

// ===== HTTP Server (serves connect page) =====
const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Serve connect page
  if (req.url === '/' || req.url === '/connect') {
    const connectPath = path.join(__dirname, 'connect.html');
    if (fs.existsSync(connectPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(connectPath));
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>Basketball Queue Sync Server Running!</h1>');
    }
    return;
  }

  // API: Get current state
  if (req.url === '/api/state') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(sharedState));
    return;
  }

  // API: Get connection info
  if (req.url === '/api/info') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      connectedClients: clients.size,
      serverTime: new Date().toISOString(),
      port: PORT,
    }));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

// ===== WebSocket Server =====
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`✅ Client connected! Total: ${clients.size}`);

  // Send current state to new client
  ws.send(JSON.stringify({
    type: 'FULL_STATE',
    state: sharedState,
    clientCount: clients.size,
  }));

  // Broadcast updated client count
  broadcastClientCount();

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case 'STATE_UPDATE':
          // Update shared state
          sharedState = { ...sharedState, ...message.state };
          // Broadcast to all OTHER clients
          broadcastToOthers(ws, {
            type: 'STATE_UPDATE',
            state: message.state,
          });
          break;

        case 'ACTION':
          // Broadcast action to all OTHER clients
          broadcastToOthers(ws, {
            type: 'ACTION',
            action: message.action,
            payload: message.payload,
          });
          break;

        case 'FULL_STATE_UPDATE':
          // Full state replacement
          sharedState = message.state;
          broadcastToOthers(ws, {
            type: 'FULL_STATE',
            state: sharedState,
            clientCount: clients.size,
          });
          break;

        case 'REQUEST_STATE':
          // Client requesting current state
          ws.send(JSON.stringify({
            type: 'FULL_STATE',
            state: sharedState,
            clientCount: clients.size,
          }));
          break;
      }
    } catch (err) {
      console.error('Error parsing message:', err);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`❌ Client disconnected. Total: ${clients.size}`);
    broadcastClientCount();
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
    clients.delete(ws);
  });
});

function broadcastToOthers(sender, message) {
  const data = JSON.stringify(message);
  clients.forEach((client) => {
    if (client !== sender && client.readyState === 1) {
      client.send(data);
    }
  });
}

function broadcastClientCount() {
  const msg = JSON.stringify({
    type: 'CLIENT_COUNT',
    count: clients.size,
  });
  clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(msg);
    }
  });
}

// ===== Timer sync (server-side timer) =====
let timerInterval = null;

function startServerTimer() {
  if (timerInterval) clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    if (sharedState.isTimerRunning && sharedState.timeLeft > 0) {
      sharedState.timeLeft -= 1;
      
      // Broadcast timer tick to all clients
      const msg = JSON.stringify({
        type: 'TIMER_TICK',
        timeLeft: sharedState.timeLeft,
      });
      clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(msg);
        }
      });

      if (sharedState.timeLeft <= 0) {
        sharedState.isTimerRunning = false;
        const endMsg = JSON.stringify({
          type: 'TIMER_END',
        });
        clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(endMsg);
          }
        });
      }
    }
  }, 1000);
}

startServerTimer();

// ===== Start Server =====
server.listen(PORT, '0.0.0.0', () => {
  // Get local IP
  const os = require('os');
  const interfaces = os.networkInterfaces();
  let localIP = 'localhost';
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address;
        break;
      }
    }
  }

  console.log('');
  console.log('🏀 ========================================');
  console.log('🏀  Basketball Queue Sync Server');
  console.log('🏀 ========================================');
  console.log('');
  console.log(`   📡 Server:    http://${localIP}:${PORT}`);
  console.log(`   🔌 WebSocket: ws://${localIP}:${PORT}`);
  console.log(`   🌐 Connect:   http://${localIP}:${PORT}/connect`);
  console.log('');
  console.log('   ทุกเครื่องที่เชื่อม WiFi เดียวกันสามารถ');
  console.log('   เข้าใช้งานและดูข้อมูลเดียวกันได้!');
  console.log('');
  console.log('🏀 ========================================');
  console.log('');
});
