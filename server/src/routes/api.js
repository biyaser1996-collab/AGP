/**
 * Main API routes - proxy to GHL via the client service.
 * These are consumed by the React frontend.
 */
const express = require('express');
const GhlClient = require('../services/ghlClient');
const oauthService = require('../services/oauthService');

const router = express.Router();

// Middleware: ensure authenticated and create GHL client
function requireAuth(req, res, next) {
  const locationId = req.headers['x-location-id'] || req.session?.locationId;
  if (!locationId) {
    return res.status(401).json({ error: 'Not authenticated. Complete OAuth flow first.' });
  }

  const token = oauthService.getTokenForLocation(locationId);
  if (!token) {
    return res.status(401).json({ error: 'No valid token for this location.' });
  }

  req.ghl = new GhlClient(token.accessToken, locationId);
  req.locationId = locationId;
  next();
}

// ─── Contacts ────────────────────────────────────────────

router.get('/contacts', requireAuth, async (req, res) => {
  try {
    const result = await req.ghl.getContacts(req.query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/contacts/:id', requireAuth, async (req, res) => {
  try {
    const contact = await req.ghl.getContact(req.params.id);
    res.json({ contact });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/contacts', requireAuth, async (req, res) => {
  try {
    const contact = await req.ghl.createContact(req.body);
    res.status(201).json({ contact });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Calendars ───────────────────────────────────────────

router.get('/calendars', requireAuth, async (req, res) => {
  try {
    const calendars = await req.ghl.getCalendars();
    res.json({ calendars });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/appointments', requireAuth, async (req, res) => {
  try {
    const events = await req.ghl.getAppointments(req.query);
    res.json({ events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Pipelines ───────────────────────────────────────────

router.get('/pipelines', requireAuth, async (req, res) => {
  try {
    const pipelines = await req.ghl.getPipelines();
    res.json({ pipelines });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/opportunities', requireAuth, async (req, res) => {
  try {
    const opportunities = await req.ghl.getOpportunities(req.query);
    res.json({ opportunities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Dashboard summary ──────────────────────────────────

router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const [contactsData, calendars, pipelines, opportunities] = await Promise.all([
      req.ghl.getContacts({ limit: 5 }),
      req.ghl.getCalendars(),
      req.ghl.getPipelines(),
      req.ghl.getOpportunities(),
    ]);

    res.json({
      summary: {
        totalContacts: contactsData.meta?.total || 0,
        recentContacts: contactsData.contacts,
        calendars: calendars.length,
        activePipelines: pipelines.length,
        openOpportunities: opportunities.filter(o => o.status === 'open').length,
        totalPipelineValue: opportunities
          .filter(o => o.status === 'open')
          .reduce((sum, o) => sum + (o.monetaryValue || 0), 0),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
