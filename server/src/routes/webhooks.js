/**
 * GHL webhook receiver - handles incoming events from Go High Level.
 * In mock mode, you can trigger test webhooks via POST /api/webhooks/test/:eventType
 */
const express = require('express');
const webhookEvents = require('../mock/data/webhookEvents');

const router = express.Router();

// Receive webhooks from GHL
router.post('/ghl', (req, res) => {
  const event = req.body;
  console.log(`[GHL Webhook] ${event.type}`, JSON.stringify(event).slice(0, 300));

  switch (event.type) {
    case 'ContactCreate':
      handleNewContact(event.body);
      break;
    case 'AppointmentCreate':
      handleNewAppointment(event.body);
      break;
    case 'OpportunityStageUpdate':
      handleStageChange(event.body);
      break;
    case 'ContactTagUpdate':
      handleTagUpdate(event.body);
      break;
    default:
      console.log(`[GHL Webhook] Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// Test endpoint: fire a mock webhook
router.post('/test/:eventType', (req, res) => {
  const eventType = req.params.eventType;
  const mockEvent = webhookEvents[eventType];

  if (!mockEvent) {
    return res.status(404).json({
      error: `Unknown event type: ${eventType}`,
      available: Object.keys(webhookEvents),
    });
  }

  console.log(`[Mock Webhook] Firing ${eventType}`);

  // Process the event locally
  switch (eventType) {
    case 'ContactCreate': handleNewContact(mockEvent.body); break;
    case 'AppointmentCreate': handleNewAppointment(mockEvent.body); break;
    case 'OpportunityStageUpdate': handleStageChange(mockEvent.body); break;
    case 'ContactTagUpdate': handleTagUpdate(mockEvent.body); break;
  }

  res.json({ fired: true, event: mockEvent });
});

// ─── Handlers ────────────────────────────────────────────

function handleNewContact(contact) {
  console.log(`[Workflow] New contact: ${contact.firstName} ${contact.lastName}`);
  // TODO: Trigger welcome sequence
  // TODO: Check if Vapi call should be scheduled
}

function handleNewAppointment(appointment) {
  console.log(`[Workflow] New appointment: ${appointment.title} at ${appointment.startTime}`);
  // TODO: Send confirmation via SMS/email
  // TODO: Schedule reminder call via Vapi
}

function handleStageChange(data) {
  console.log(`[Workflow] Stage change: ${data.previousStageId} -> ${data.currentStageId}`);
  // TODO: Trigger stage-specific workflows
  // TODO: Send relevant educational content
}

function handleTagUpdate(data) {
  console.log(`[Workflow] Tags updated for contact ${data.id}:`, data.tags);
  // TODO: Trigger tag-based automations
}

module.exports = router;
