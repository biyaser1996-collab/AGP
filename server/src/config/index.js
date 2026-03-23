require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

module.exports = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  useMockGhl: process.env.USE_MOCK_GHL === 'true',

  db: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/ghl_fertility',
  },

  ghl: {
    clientId: process.env.GHL_CLIENT_ID,
    clientSecret: process.env.GHL_CLIENT_SECRET,
    redirectUri: process.env.GHL_REDIRECT_URI || 'http://localhost:3001/api/oauth/callback',
    scopes: process.env.GHL_SCOPES || 'contacts.readonly contacts.write calendars.readonly calendars.write',
    apiBase: process.env.GHL_API_BASE || 'https://services.leadconnectorhq.com',
    authUrl: 'https://marketplace.gohighlevel.com/oauth/chooselocation',
    tokenUrl: 'https://services.leadconnectorhq.com/oauth/token',
  },

  vapi: {
    apiKey: process.env.VAPI_API_KEY,
    baseUrl: process.env.VAPI_BASE_URL || 'https://api.vapi.ai',
  },

  session: {
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  },
};
