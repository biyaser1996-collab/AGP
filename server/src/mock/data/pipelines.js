// Fertility clinic treatment pipeline stages matching GHL opportunities
const pipelines = [
  {
    id: 'pipe_fertility_journey',
    locationId: 'loc_mock_fertility_clinic_01',
    name: 'Fertility Treatment Journey',
    stages: [
      { id: 'stage_inquiry', name: 'New Inquiry', position: 0 },
      { id: 'stage_consult_scheduled', name: 'Consultation Scheduled', position: 1 },
      { id: 'stage_consult_complete', name: 'Consultation Complete', position: 2 },
      { id: 'stage_testing', name: 'Diagnostic Testing', position: 3 },
      { id: 'stage_treatment_plan', name: 'Treatment Plan Review', position: 4 },
      { id: 'stage_active_treatment', name: 'Active Treatment', position: 5 },
      { id: 'stage_tww', name: 'Two-Week Wait', position: 6 },
      { id: 'stage_outcome', name: 'Outcome / Follow-Up', position: 7 },
    ],
  },
  {
    id: 'pipe_egg_freezing',
    locationId: 'loc_mock_fertility_clinic_01',
    name: 'Egg Freezing Pipeline',
    stages: [
      { id: 'stage_ef_inquiry', name: 'Inquiry', position: 0 },
      { id: 'stage_ef_consult', name: 'Consultation', position: 1 },
      { id: 'stage_ef_testing', name: 'Baseline Testing', position: 2 },
      { id: 'stage_ef_stimulation', name: 'Ovarian Stimulation', position: 3 },
      { id: 'stage_ef_retrieval', name: 'Egg Retrieval', position: 4 },
      { id: 'stage_ef_storage', name: 'Eggs in Storage', position: 5 },
    ],
  },
];

const opportunities = [
  {
    id: 'opp_001',
    pipelineId: 'pipe_fertility_journey',
    pipelineStageId: 'stage_active_treatment',
    locationId: 'loc_mock_fertility_clinic_01',
    contactId: null, // linked at runtime from contacts[0]
    name: 'Sarah Mitchell - IVF Cycle 1',
    monetaryValue: 18000,
    status: 'open',
    dateAdded: '2024-01-15T10:30:00Z',
  },
  {
    id: 'opp_002',
    pipelineId: 'pipe_fertility_journey',
    pipelineStageId: 'stage_consult_scheduled',
    locationId: 'loc_mock_fertility_clinic_01',
    contactId: null,
    name: 'Maria Garcia - IUI Consultation',
    monetaryValue: 3500,
    status: 'open',
    dateAdded: '2024-01-20T09:00:00Z',
  },
  {
    id: 'opp_003',
    pipelineId: 'pipe_egg_freezing',
    pipelineStageId: 'stage_ef_consult',
    locationId: 'loc_mock_fertility_clinic_01',
    contactId: null,
    name: 'Emily Chen - Egg Freezing',
    monetaryValue: 12000,
    status: 'open',
    dateAdded: '2024-02-05T16:00:00Z',
  },
];

module.exports = { pipelines, opportunities };
