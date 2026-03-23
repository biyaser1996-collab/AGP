/**
 * GHL API client - routes through mock or real API based on config.
 * When USE_MOCK_GHL=true, requests go to the local mock server.
 * When false, requests go to the real GHL API with OAuth tokens.
 */
const axios = require('axios');
const config = require('../config');

class GhlClient {
  constructor(accessToken, locationId) {
    this.accessToken = accessToken;
    this.locationId = locationId;

    const baseURL = config.useMockGhl
      ? `http://localhost:${config.port}/api/mock/ghl`
      : config.ghl.apiBase;

    this.http = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Version: '2021-07-28',
      },
    });
  }

  // ─── Contacts ──────────────────────────────────────────

  async getContacts(params = {}) {
    const { data } = await this.http.get('/contacts', {
      params: { locationId: this.locationId, ...params },
    });
    return data;
  }

  async getContact(id) {
    const { data } = await this.http.get(`/contacts/${id}`);
    return data.contact;
  }

  async createContact(contactData) {
    const { data } = await this.http.post('/contacts', {
      locationId: this.locationId,
      ...contactData,
    });
    return data.contact;
  }

  async updateContact(id, updates) {
    const { data } = await this.http.put(`/contacts/${id}`, updates);
    return data.contact;
  }

  // ─── Calendars ─────────────────────────────────────────

  async getCalendars() {
    const { data } = await this.http.get('/calendars', {
      params: { locationId: this.locationId },
    });
    return data.calendars;
  }

  async getAppointments(params = {}) {
    const { data } = await this.http.get('/calendars/events', {
      params: { locationId: this.locationId, ...params },
    });
    return data.events;
  }

  async createAppointment(eventData) {
    const { data } = await this.http.post('/calendars/events', {
      locationId: this.locationId,
      ...eventData,
    });
    return data.event;
  }

  // ─── Pipelines / Opportunities ─────────────────────────

  async getPipelines() {
    const { data } = await this.http.get('/opportunities/pipelines');
    return data.pipelines;
  }

  async getOpportunities(params = {}) {
    const { data } = await this.http.get('/opportunities', {
      params: { locationId: this.locationId, ...params },
    });
    return data.opportunities;
  }

  async updateOpportunityStage(oppId, stageId) {
    const { data } = await this.http.put(`/opportunities/${oppId}/status`, {
      pipelineStageId: stageId,
    });
    return data.opportunity;
  }
}

module.exports = GhlClient;
