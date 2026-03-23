/**
 * Mock GHL API handlers - simulates Go High Level API responses.
 * Based on https://highlevel.stoplight.io/docs/integrations (GHL public API docs).
 * Toggle via USE_MOCK_GHL=true in .env.
 */
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const contacts = require('../data/contacts');
const { calendars, generateAppointments } = require('../data/calendars');
const { pipelines, opportunities } = require('../data/pipelines');

const router = express.Router();

// Link opportunity contactIds to actual contact ids
opportunities[0].contactId = contacts[0].id;
opportunities[1].contactId = contacts[1].id;
opportunities[2].contactId = contacts[2].id;

let mockAppointments = generateAppointments();

// ─── Contacts ────────────────────────────────────────────────

router.get('/contacts', (req, res) => {
  const { locationId, query, limit = 20, offset = 0 } = req.query;
  let results = [...contacts];

  if (locationId) results = results.filter(c => c.locationId === locationId);
  if (query) {
    const q = query.toLowerCase();
    results = results.filter(c =>
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  }

  res.json({
    contacts: results.slice(Number(offset), Number(offset) + Number(limit)),
    meta: { total: results.length, currentPage: 1, nextPage: null },
  });
});

router.get('/contacts/:id', (req, res) => {
  const contact = contacts.find(c => c.id === req.params.id);
  if (!contact) return res.status(404).json({ message: 'Contact not found' });
  res.json({ contact });
});

router.post('/contacts', (req, res) => {
  const newContact = {
    id: uuidv4(),
    locationId: req.body.locationId || 'loc_mock_fertility_clinic_01',
    ...req.body,
    dateAdded: new Date().toISOString(),
    dateUpdated: new Date().toISOString(),
  };
  contacts.push(newContact);
  res.status(201).json({ contact: newContact });
});

router.put('/contacts/:id', (req, res) => {
  const idx = contacts.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Contact not found' });
  contacts[idx] = { ...contacts[idx], ...req.body, dateUpdated: new Date().toISOString() };
  res.json({ contact: contacts[idx] });
});

// ─── Calendars ───────────────────────────────────────────────

router.get('/calendars', (req, res) => {
  const { locationId } = req.query;
  let results = [...calendars];
  if (locationId) results = results.filter(c => c.locationId === locationId);
  res.json({ calendars: results });
});

router.get('/calendars/:id', (req, res) => {
  const cal = calendars.find(c => c.id === req.params.id);
  if (!cal) return res.status(404).json({ message: 'Calendar not found' });
  res.json({ calendar: cal });
});

// ─── Appointments ────────────────────────────────────────────

router.get('/calendars/events', (req, res) => {
  const { locationId, calendarId, startTime, endTime } = req.query;
  let results = [...mockAppointments];

  if (locationId) results = results.filter(a => a.locationId === locationId);
  if (calendarId) results = results.filter(a => a.calendarId === calendarId);
  if (startTime) results = results.filter(a => a.startTime >= startTime);
  if (endTime) results = results.filter(a => a.startTime <= endTime);

  res.json({ events: results });
});

router.post('/calendars/events', (req, res) => {
  const event = {
    id: uuidv4(),
    ...req.body,
    status: req.body.status || 'confirmed',
  };
  mockAppointments.push(event);
  res.status(201).json({ event });
});

// ─── Pipelines / Opportunities ───────────────────────────────

router.get('/opportunities/pipelines', (req, res) => {
  res.json({ pipelines });
});

router.get('/opportunities', (req, res) => {
  const { pipelineId, pipelineStageId, locationId } = req.query;
  let results = [...opportunities];

  if (pipelineId) results = results.filter(o => o.pipelineId === pipelineId);
  if (pipelineStageId) results = results.filter(o => o.pipelineStageId === pipelineStageId);
  if (locationId) results = results.filter(o => o.locationId === locationId);

  res.json({ opportunities: results, meta: { total: results.length } });
});

router.put('/opportunities/:id/status', (req, res) => {
  const opp = opportunities.find(o => o.id === req.params.id);
  if (!opp) return res.status(404).json({ message: 'Opportunity not found' });
  opp.pipelineStageId = req.body.pipelineStageId || opp.pipelineStageId;
  opp.status = req.body.status || opp.status;
  res.json({ opportunity: opp });
});

// ─── OAuth Mock ──────────────────────────────────────────────

router.post('/oauth/token', (req, res) => {
  res.json({
    access_token: 'mock_access_token_' + uuidv4(),
    token_type: 'Bearer',
    expires_in: 86400,
    refresh_token: 'mock_refresh_token_' + uuidv4(),
    scope: req.body.scope || 'contacts.readonly contacts.write calendars.readonly',
    locationId: 'loc_mock_fertility_clinic_01',
    companyId: 'comp_mock_01',
    userId: 'user_mock_01',
  });
});

module.exports = router;
