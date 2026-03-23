/**
 * Vapi Voice AI integration for fertility clinic workflows.
 *
 * Handles:
 * - Creating AI phone assistants for patient calls
 * - Outbound calls (appointment reminders, follow-ups)
 * - Inbound call routing with fertility-specific prompts
 * - Call transcription and CRM sync
 *
 * Docs: https://docs.vapi.ai
 */
const axios = require('axios');
const config = require('../config');

class VapiService {
  constructor() {
    this.http = axios.create({
      baseURL: config.vapi.baseUrl,
      headers: {
        Authorization: `Bearer ${config.vapi.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // ─── Assistants ────────────────────────────────────────

  /**
   * Create a fertility clinic phone assistant with context-aware prompts.
   */
  async createFertilityAssistant(clinicName, options = {}) {
    const payload = {
      name: `${clinicName} - Fertility Assistant`,
      model: {
        provider: 'openai',
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: this._buildFertilitySystemPrompt(clinicName, options),
          },
        ],
      },
      voice: {
        provider: '11labs',
        voiceId: options.voiceId || 'rachel',
      },
      firstMessage: options.firstMessage ||
        `Hello, thank you for calling ${clinicName}. My name is Rachel, how can I help you today?`,
      transcriber: {
        provider: 'deepgram',
        model: 'nova-2',
        language: 'en',
      },
      endCallFunctionEnabled: true,
      endCallMessage: 'Thank you for calling. We look forward to helping you on your journey. Goodbye!',
      serverUrl: options.serverUrl || `http://localhost:${config.port}/api/vapi/webhook`,
      ...options.overrides,
    };

    const { data } = await this.http.post('/assistant', payload);
    return data;
  }

  /**
   * List all assistants for this account.
   */
  async listAssistants() {
    const { data } = await this.http.get('/assistant');
    return data;
  }

  // ─── Calls ─────────────────────────────────────────────

  /**
   * Initiate outbound call (e.g. appointment reminder).
   */
  async makeOutboundCall(assistantId, phoneNumber, metadata = {}) {
    const { data } = await this.http.post('/call/phone', {
      assistantId,
      customer: { number: phoneNumber },
      metadata,
    });
    return data;
  }

  /**
   * Get call details and transcript.
   */
  async getCall(callId) {
    const { data } = await this.http.get(`/call/${callId}`);
    return data;
  }

  /**
   * List recent calls.
   */
  async listCalls(limit = 20) {
    const { data } = await this.http.get('/call', { params: { limit } });
    return data;
  }

  // ─── Fertility-specific prompts ────────────────────────

  _buildFertilitySystemPrompt(clinicName, options = {}) {
    return `You are a friendly, empathetic, and professional virtual receptionist for ${clinicName}, a fertility clinic.

IMPORTANT GUIDELINES:
- Be warm and compassionate - fertility patients may be going through a difficult emotional journey
- NEVER provide medical advice, diagnoses, or treatment recommendations
- For medical questions, always say you'll have a nurse or doctor call them back
- Maintain strict HIPAA compliance - verify patient identity before discussing any details
- Use supportive, non-judgmental language

YOU CAN HELP WITH:
- Scheduling and rescheduling appointments
- Providing clinic hours and location information
- Explaining general process for new patient intake
- Transferring to a nurse for medical questions
- Taking messages for the care team
- Providing general information about services offered (IVF, IUI, egg freezing, etc.)

CLINIC DETAILS:
- Name: ${clinicName}
- Hours: ${options.clinicHours || 'Monday-Friday 7am-5pm, Saturday 7am-9am for monitoring'}
- Address: ${options.clinicAddress || '[Clinic address]'}
- For emergencies: Direct patients to call 911 or go to nearest ER

APPOINTMENT TYPES AVAILABLE:
- Initial Consultation (60 min) - for new patients
- Cycle Monitoring (30 min) - ultrasound and bloodwork
- Nurse Phone Consultation (15 min) - questions about medications/results
- Follow-up with Doctor (30 min) - treatment plan review

When a patient wants to schedule, collect:
1. Full name and date of birth (for verification)
2. Type of appointment needed
3. Preferred date/time
4. Insurance information (if new patient)
5. Reason for visit (brief)

Always end calls warmly and let patients know they're supported.`;
  }
}

module.exports = new VapiService();
