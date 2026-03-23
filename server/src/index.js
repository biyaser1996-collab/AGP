require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ─── Middleware ───────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(session({
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
}));

// ─── Mock GHL API (development only) ────────────────────
if (config.useMockGhl) {
  const mockGhlApi = require('./mock/handlers/ghlMockApi');
  app.use('/api/mock/ghl', mockGhlApi);
  console.log('[Mock] GHL mock API enabled at /api/mock/ghl');
}

// ─── Routes ──────────────────────────────────────────────
app.use('/api/oauth', require('./routes/oauth'));
app.use('/api/vapi', require('./routes/vapi'));
app.use('/api/webhooks', require('./routes/webhooks'));
app.use('/api', require('./routes/api'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mockMode: config.useMockGhl,
    timestamp: new Date().toISOString(),
  });
});

// ─── Error handling ──────────────────────────────────────
app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`\n🏥 GHL Fertility Marketplace App`);
  console.log(`   Server:    http://localhost:${config.port}`);
  console.log(`   Mock GHL:  ${config.useMockGhl ? 'ENABLED' : 'disabled'}`);
  console.log(`   Env:       ${config.nodeEnv}\n`);
  console.log(`   Endpoints:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - GET  /api/oauth/authorize`);
  console.log(`   - GET  /api/oauth/callback`);
  console.log(`   - GET  /api/dashboard`);
  console.log(`   - GET  /api/contacts`);
  console.log(`   - GET  /api/calendars`);
  console.log(`   - GET  /api/pipelines`);
  console.log(`   - POST /api/vapi/assistants`);
  console.log(`   - POST /api/webhooks/test/:eventType\n`);
});

module.exports = app;
