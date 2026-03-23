const express = require('express');
const { v4: uuidv4 } = require('uuid');
const oauthService = require('../services/oauthService');

const router = express.Router();

// Step 1: Redirect to GHL authorization
router.get('/authorize', (req, res) => {
  const state = uuidv4();
  req.session.oauthState = state;
  const authUrl = oauthService.getAuthorizationUrl(state);
  res.redirect(authUrl);
});

// Step 2: Handle GHL OAuth callback
router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.status(400).json({ error: 'OAuth authorization denied', details: error });
  }

  // Verify state to prevent CSRF
  if (state && state !== req.session.oauthState) {
    return res.status(403).json({ error: 'Invalid OAuth state' });
  }

  try {
    const tokens = await oauthService.exchangeCodeForTokens(code);
    req.session.locationId = tokens.locationId;

    // In production, redirect to the app's settings page
    res.json({
      success: true,
      message: 'OAuth connection established',
      locationId: tokens.locationId,
    });
  } catch (err) {
    console.error('OAuth callback error:', err.message);
    res.status(500).json({ error: 'Failed to exchange authorization code' });
  }
});

// Check connection status
router.get('/status', (req, res) => {
  const locations = oauthService.getAllLocations();
  res.json({
    connected: locations.length > 0,
    locations,
  });
});

// Disconnect a location
router.post('/disconnect', (req, res) => {
  // In production: revoke tokens and remove from DB
  res.json({ success: true, message: 'Disconnected (mock)' });
});

module.exports = router;
