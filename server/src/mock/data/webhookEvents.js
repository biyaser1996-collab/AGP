// Sample GHL webhook payloads for testing
const contacts = require('./contacts');

const webhookEvents = {
  'ContactCreate': {
    type: 'ContactCreate',
    locationId: 'loc_mock_fertility_clinic_01',
    body: {
      id: contacts[0]?.id,
      firstName: 'New',
      lastName: 'Patient',
      email: 'new.patient@example.com',
      phone: '+14155559999',
      tags: ['new-inquiry'],
      source: 'website_form',
      dateAdded: new Date().toISOString(),
    },
  },
  'AppointmentCreate': {
    type: 'AppointmentCreate',
    locationId: 'loc_mock_fertility_clinic_01',
    body: {
      id: 'evt_mock_new',
      calendarId: 'cal_initial_consult',
      contactId: contacts[0]?.id,
      title: 'New Patient Consultation',
      status: 'confirmed',
      startTime: new Date(Date.now() + 86400000).toISOString(),
      endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
    },
  },
  'OpportunityStageUpdate': {
    type: 'OpportunityStageUpdate',
    locationId: 'loc_mock_fertility_clinic_01',
    body: {
      id: 'opp_001',
      pipelineId: 'pipe_fertility_journey',
      previousStageId: 'stage_testing',
      currentStageId: 'stage_active_treatment',
      contactId: contacts[0]?.id,
    },
  },
  'ContactTagUpdate': {
    type: 'ContactTagUpdate',
    locationId: 'loc_mock_fertility_clinic_01',
    body: {
      id: contacts[0]?.id,
      tags: ['ivf-patient', 'new-inquiry', 'insurance-verified', 'urgent-callback'],
    },
  },
};

module.exports = webhookEvents;
