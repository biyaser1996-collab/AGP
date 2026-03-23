const express = require('express');
const mockGhlApi = require('../mock/handlers/ghlMockApi');

// Lightweight test using the mock router directly
describe('Mock GHL API', () => {
  let app, server;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use('/api/mock/ghl', mockGhlApi);
    await new Promise((resolve) => { server = app.listen(0, resolve); });
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  function getBaseUrl() {
    return `http://localhost:${server.address().port}/api/mock/ghl`;
  }

  test('GET /contacts returns fertility patient data', async () => {
    const res = await fetch(`${getBaseUrl()}/contacts`);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.contacts).toBeDefined();
    expect(data.contacts.length).toBeGreaterThan(0);

    // Verify fertility-specific custom fields
    const first = data.contacts[0];
    expect(first.customFields).toBeDefined();
    const treatmentField = first.customFields.find(f => f.key === 'treatment_type');
    expect(treatmentField).toBeDefined();
  });

  test('GET /contacts supports search', async () => {
    const res = await fetch(`${getBaseUrl()}/contacts?query=sarah`);
    const data = await res.json();

    expect(data.contacts.length).toBe(1);
    expect(data.contacts[0].firstName).toBe('Sarah');
  });

  test('POST /contacts creates a new contact', async () => {
    const res = await fetch(`${getBaseUrl()}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'Patient',
        email: 'test@example.com',
        phone: '+14155550000',
        tags: ['test'],
      }),
    });
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.contact.firstName).toBe('Test');
    expect(data.contact.id).toBeDefined();
  });

  test('GET /calendars returns fertility appointment types', async () => {
    const res = await fetch(`${getBaseUrl()}/calendars`);
    const data = await res.json();

    expect(data.calendars.length).toBeGreaterThan(0);
    const calNames = data.calendars.map(c => c.name);
    expect(calNames).toContain('Initial Fertility Consultation');
    expect(calNames).toContain('Cycle Monitoring');
    expect(calNames).toContain('Egg Retrieval');
  });

  test('GET /opportunities/pipelines returns treatment pipelines', async () => {
    const res = await fetch(`${getBaseUrl()}/opportunities/pipelines`);
    const data = await res.json();

    expect(data.pipelines.length).toBe(2);
    expect(data.pipelines[0].name).toBe('Fertility Treatment Journey');
    expect(data.pipelines[0].stages.length).toBe(8);
  });

  test('POST /oauth/token returns mock tokens', async () => {
    const res = await fetch(`${getBaseUrl()}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grant_type: 'authorization_code', code: 'test' }),
    });
    const data = await res.json();

    expect(data.access_token).toBeDefined();
    expect(data.refresh_token).toBeDefined();
    expect(data.locationId).toBe('loc_mock_fertility_clinic_01');
  });
});
