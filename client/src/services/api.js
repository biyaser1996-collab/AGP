import axios from 'axios';

const api = axios.create({
  baseURL: window.location.origin + '/api',
  withCredentials: true,
});

// Auto-attach location header for mock mode
api.interceptors.request.use((config) => {
  const locationId = localStorage.getItem('locationId');
  if (locationId) {
    config.headers['X-Location-Id'] = locationId;
  }
  return config;
});

export const healthCheck = () => api.get('/health');
export const getOAuthStatus = () => api.get('/oauth/status');
export const getDashboard = () => api.get('/dashboard');
export const getContacts = (params) => api.get('/contacts', { params });
export const getCalendars = () => api.get('/calendars');
export const getAppointments = (params) => api.get('/appointments', { params });
export const getPipelines = () => api.get('/pipelines');
export const getOpportunities = (params) => api.get('/opportunities', { params });

// Vapi
export const createAssistant = (data) => api.post('/vapi/assistants', data);
export const listAssistants = () => api.get('/vapi/assistants');
export const makeCall = (data) => api.post('/vapi/calls', data);

// Webhooks (test)
export const fireTestWebhook = (eventType) => api.post(`/webhooks/test/${eventType}`);

export default api;
