const { executeWorkflow, SMS_TEMPLATES } = require('../services/fertilityWorkflows');

describe('Fertility Workflows', () => {
  test('new patient inquiry triggers welcome sequence', () => {
    const results = executeWorkflow('ContactCreate', {
      firstName: 'Test',
      lastName: 'Patient',
      tags: ['new-inquiry'],
    });

    expect(results.length).toBe(4);
    expect(results[0].step).toBe('addTag');
    expect(results[0].result.tag).toBe('welcome-sequence-started');
    expect(results[1].step).toBe('sendSms');
    expect(results[2].step).toBe('scheduleVapiCall');
    expect(results[3].step).toBe('createOpportunity');
  });

  test('appointment creation triggers confirmation', () => {
    const results = executeWorkflow('AppointmentCreate', {
      title: 'Initial Consultation',
      contactId: 'test_contact',
    });

    expect(results.length).toBe(3);
    expect(results[0].step).toBe('sendSms');
    expect(results[0].result.template).toBe('appointment_confirmed');
  });

  test('stage change to active treatment triggers checkin', () => {
    const results = executeWorkflow('OpportunityStageUpdate', {
      currentStageId: 'stage_active_treatment',
      previousStageId: 'stage_treatment_plan',
    });

    expect(results.length).toBe(2);
    expect(results[0].result.template).toBe('treatment_started');
    expect(results[1].result.type).toBe('treatment_checkin');
  });

  test('TWW stage triggers support messaging', () => {
    const results = executeWorkflow('OpportunityStageUpdate', {
      currentStageId: 'stage_tww',
      previousStageId: 'stage_active_treatment',
    });

    expect(results[0].result.template).toBe('tww_support');
  });

  test('SMS templates contain required placeholders', () => {
    expect(SMS_TEMPLATES.welcome_new_patient).toContain('{clinicName}');
    expect(SMS_TEMPLATES.appointment_confirmed).toContain('{date}');
    expect(SMS_TEMPLATES.appointment_confirmed).toContain('{time}');
  });

  test('unmatched event returns empty results', () => {
    const results = executeWorkflow('UnknownEvent', {});
    expect(results).toEqual([]);
  });
});
