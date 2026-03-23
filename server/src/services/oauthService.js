/**
 * GHL OAuth 2.0 service.
 * Implements the marketplace OAuth flow:
 *   1. Redirect user to GHL authorization URL
 *   2. Handle callback with authorization code
 *   3. Exchange code for access + refresh tokens
 *   4. Auto-refresh tokens before expiry
 *
 * Docs: https://highlevel.stoplight.io/docs/integrations/authentication
 */
const axios = require('axios');
const config = require('../config');

// In-memory token store (replace with DB in production)
const tokenStore = new Map();

function getAuthorizationUrl(state) {
  const params = new URLSearchParams({
    response_type: 'code',
    redirect_uri: config.ghl.redirectUri,
    client_id: config.ghl.clientId,
    scope: config.ghl.scopes,
    state: state || '',
  });
  return `${config.ghl.authUrl}?${params.toString()}`;
}

async function exchangeCodeForTokens(code) {
  const tokenUrl = config.useMockGhl
    ? `http://localhost:${config.port}/api/mock/ghl/oauth/token`
    : config.ghl.tokenUrl;

  const { data } = await axios.post(tokenUrl, {
    client_id: config.ghl.clientId,
    client_secret: config.ghl.clientSecret,
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.ghl.redirectUri,
  });

  const tokenData = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    locationId: data.locationId,
    companyId: data.companyId,
    scope: data.scope,
  };

  tokenStore.set(data.locationId, tokenData);
  return tokenData;
}

async function refreshAccessToken(locationId) {
  const existing = tokenStore.get(locationId);
  if (!existing) throw new Error(`No tokens found for location ${locationId}`);

  const tokenUrl = config.useMockGhl
    ? `http://localhost:${config.port}/api/mock/ghl/oauth/token`
    : config.ghl.tokenUrl;

  const { data } = await axios.post(tokenUrl, {
    client_id: config.ghl.clientId,
    client_secret: config.ghl.clientSecret,
    grant_type: 'refresh_token',
    refresh_token: existing.refreshToken,
  });

  const tokenData = {
    ...existing,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  tokenStore.set(locationId, tokenData);
  return tokenData;
}

async function getValidToken(locationId) {
  const existing = tokenStore.get(locationId);
  if (!existing) throw new Error(`No tokens found for location ${locationId}`);

  // Refresh if expiring within 5 minutes
  if (existing.expiresAt - Date.now() < 5 * 60 * 1000) {
    return refreshAccessToken(locationId);
  }

  return existing;
}

function getTokenForLocation(locationId) {
  return tokenStore.get(locationId) || null;
}

function getAllLocations() {
  return Array.from(tokenStore.keys());
}

module.exports = {
  getAuthorizationUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  getValidToken,
  getTokenForLocation,
  getAllLocations,
};
