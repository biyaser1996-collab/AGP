const express = require('express');
const vapiService = require('../services/vapiService');

const router = express.Router();

// Create a new fertility assistant
router.post('/assistants', async (req, res) => {
  try {
    const { clinicName, options } = req.body;
    const assistant = await vapiService.createFertilityAssistant(
      clinicName || 'Fertility Clinic',
      options || {}
    );
    res.status(201).json({ assistant });
  } catch (err) {
    console.error('Failed to create assistant:', err.message);
    res.status(500).json({ error: 'Failed to create Vapi assistant' });
  }
});

// List assistants
router.get('/assistants', async (req, res) => {
  try {
    const assistants = await vapiService.listAssistants();
    res.json({ assistants });
  } catch (err) {
    console.error('Failed to list assistants:', err.message);
    res.status(500).json({ error: 'Failed to list assistants' });
  }
});

// Make an outbound call
router.post('/calls', async (req, res) => {
  try {
    const { assistantId, phoneNumber, metadata } = req.body;
    const call = await vapiService.makeOutboundCall(assistantId, phoneNumber, metadata);
    res.status(201).json({ call });
  } catch (err) {
    console.error('Failed to make call:', err.message);
    res.status(500).json({ error: 'Failed to initiate call' });
  }
});

// Get call details
router.get('/calls/:id', async (req, res) => {
  try {
    const call = await vapiService.getCall(req.params.id);
    res.json({ call });
  } catch (err) {
    console.error('Failed to get call:', err.message);
    res.status(500).json({ error: 'Failed to get call details' });
  }
});

// Vapi webhook - receives call events
router.post('/webhook', (req, res) => {
  const { message } = req.body;
  console.log('[Vapi Webhook]', message?.type, JSON.stringify(req.body, null, 2).slice(0, 200));

  switch (message?.type) {
    case 'function-call':
      return handleFunctionCall(req, res);
    case 'end-of-call-report':
      return handleCallEnd(req, res);
    case 'status-update':
      console.log('[Vapi] Call status:', message.status);
      return res.json({ ok: true });
    default:
      return res.json({ ok: true });
  }
});

// Handle Vapi function calls (e.g., scheduling, lookup)
function handleFunctionCall(req, res) {
  const { message } = req.body;
  const fnName = message.functionCall?.name;
  const args = message.functionCall?.parameters || {};

  console.log(`[Vapi Function] ${fnName}`, args);

  switch (fnName) {
    case 'schedule_appointment':
      return res.json({
        result: `Appointment scheduled for ${args.patientName} on ${args.date} at ${args.time} for ${args.appointmentType}. A confirmation will be sent shortly.`,
      });
    case 'check_availability':
      return res.json({
        result: `Available slots for ${args.appointmentType}: Tomorrow at 9:00 AM, 10:30 AM, and 2:00 PM. Thursday at 9:00 AM and 11:00 AM.`,
      });
    case 'transfer_to_nurse':
      return res.json({
        result: 'Transferring you to our nursing team now. Please hold for a moment.',
      });
    default:
      return res.json({ result: 'I understand. Let me connect you with our team for further assistance.' });
  }
}

// Handle end-of-call report - sync to GHL
function handleCallEnd(req, res) {
  const { message } = req.body;
  console.log('[Vapi] Call ended:', {
    duration: message.endedReason,
    transcript: message.transcript?.slice(0, 200),
  });

  // TODO: Sync call notes to GHL contact record
  // TODO: Create follow-up task if needed
  // TODO: Update opportunity stage if appointment was booked

  res.json({ ok: true });
}

module.exports = router;
