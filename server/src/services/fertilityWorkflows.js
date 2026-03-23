/**
 * Fertility-specific workflow automations.
 * These are triggered by GHL webhooks and orchestrate
 * actions across GHL contacts, calendars, and Vapi calls.
 */

const WORKFLOW_DEFINITIONS = {
  // New patient inquiry -> welcome sequence
  newPatientWelcome: {
    trigger: 'ContactCreate',
    conditions: (contact) => contact.tags?.includes('new-inquiry'),
    steps: [
      { action: 'addTag', params: { tag: 'welcome-sequence-started' } },
      { action: 'sendSms', params: { template: 'welcome_new_patient' } },
      { action: 'scheduleVapiCall', params: { delay: '2h', type: 'welcome_call' } },
      { action: 'createOpportunity', params: { pipeline: 'pipe_fertility_journey', stage: 'stage_inquiry' } },
    ],
  },

  // Appointment booked -> confirmation + reminders
  appointmentConfirmation: {
    trigger: 'AppointmentCreate',
    conditions: () => true,
    steps: [
      { action: 'sendSms', params: { template: 'appointment_confirmed' } },
      { action: 'scheduleVapiCall', params: { delay: '-24h', type: 'appointment_reminder' } },
      { action: 'addTag', params: { tag: 'appointment-scheduled' } },
    ],
  },

  // Stage change -> educational content delivery
  treatmentStageAdvance: {
    trigger: 'OpportunityStageUpdate',
    conditions: () => true,
    stageActions: {
      stage_consult_complete: [
        { action: 'sendSms', params: { template: 'post_consultation_info' } },
        { action: 'addTag', params: { tag: 'consultation-complete' } },
      ],
      stage_testing: [
        { action: 'sendSms', params: { template: 'diagnostic_testing_prep' } },
      ],
      stage_active_treatment: [
        { action: 'sendSms', params: { template: 'treatment_started' } },
        { action: 'scheduleVapiCall', params: { delay: '3d', type: 'treatment_checkin' } },
      ],
      stage_tww: [
        { action: 'sendSms', params: { template: 'tww_support' } },
        { action: 'scheduleVapiCall', params: { delay: '7d', type: 'tww_checkin' } },
      ],
      stage_outcome: [
        { action: 'scheduleVapiCall', params: { delay: '1d', type: 'outcome_followup' } },
      ],
    },
  },

  // Missed appointment -> follow-up
  missedAppointmentFollowUp: {
    trigger: 'AppointmentStatusChange',
    conditions: (data) => data.status === 'no_show',
    steps: [
      { action: 'addTag', params: { tag: 'missed-appointment' } },
      { action: 'sendSms', params: { template: 'missed_appointment' } },
      { action: 'scheduleVapiCall', params: { delay: '4h', type: 'reschedule_call' } },
    ],
  },
};

// SMS templates for fertility workflows
const SMS_TEMPLATES = {
  welcome_new_patient:
    'Welcome to {clinicName}! We\'re honored to be part of your fertility journey. Your care team is here to support you every step of the way. We\'ll be reaching out soon to help you get started.',

  appointment_confirmed:
    'Your appointment at {clinicName} is confirmed for {date} at {time}. Location: {address}. Please arrive 15 minutes early. Questions? Call us at {phone}.',

  post_consultation_info:
    'Thank you for visiting {clinicName}. Your doctor has outlined next steps for your care plan. Log into your patient portal to review, or call us with any questions.',

  diagnostic_testing_prep:
    'Your diagnostic testing at {clinicName} is coming up. Please remember to fast after midnight if bloodwork is included. Arrive 10 minutes early. We\'re here if you have questions.',

  treatment_started:
    'Your treatment cycle has officially begun! Remember: take medications exactly as prescribed, and don\'t hesitate to call our nurse line with any concerns. You\'ve got this!',

  tww_support:
    'We know the two-week wait can be stressful. Remember to be gentle with yourself. Our nurse line is available M-F 10am-4pm for any questions. You are not alone in this.',

  missed_appointment:
    'We missed you at your appointment today. We understand things come up. Would you like to reschedule? Call us or reply to this message and we\'ll find a time that works.',
};

/**
 * Execute a workflow based on an incoming webhook event.
 */
function executeWorkflow(eventType, eventData, context = {}) {
  const results = [];

  for (const [name, workflow] of Object.entries(WORKFLOW_DEFINITIONS)) {
    if (workflow.trigger !== eventType) continue;
    if (!workflow.conditions(eventData)) continue;

    console.log(`[Workflow] Executing: ${name}`);

    const steps = workflow.stageActions
      ? workflow.stageActions[eventData.currentStageId] || []
      : workflow.steps;

    for (const step of steps) {
      const result = executeStep(step, eventData, context);
      results.push({ workflow: name, step: step.action, result });
    }
  }

  return results;
}

function executeStep(step, eventData, context) {
  console.log(`  [Step] ${step.action}:`, step.params);

  // In production, these would call actual GHL/Vapi APIs
  switch (step.action) {
    case 'addTag':
      return { action: 'addTag', tag: step.params.tag, status: 'queued' };
    case 'sendSms':
      return {
        action: 'sendSms',
        template: step.params.template,
        message: SMS_TEMPLATES[step.params.template] || 'Template not found',
        status: 'queued',
      };
    case 'scheduleVapiCall':
      return {
        action: 'scheduleVapiCall',
        type: step.params.type,
        delay: step.params.delay,
        status: 'queued',
      };
    case 'createOpportunity':
      return {
        action: 'createOpportunity',
        pipeline: step.params.pipeline,
        stage: step.params.stage,
        status: 'queued',
      };
    default:
      return { action: step.action, status: 'unknown_action' };
  }
}

module.exports = {
  WORKFLOW_DEFINITIONS,
  SMS_TEMPLATES,
  executeWorkflow,
};
