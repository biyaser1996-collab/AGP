const { v4: uuidv4 } = require('uuid');

const calendars = [
  {
    id: 'cal_initial_consult',
    locationId: 'loc_mock_fertility_clinic_01',
    name: 'Initial Fertility Consultation',
    description: 'First-time patient consultation with RE (60 min)',
    slug: 'initial-fertility-consultation',
    widgetType: 'classic',
    calendarType: 'round_robin',
    teamMembers: [
      { userId: 'user_dr_smith', name: 'Dr. Rebecca Smith', priority: 1 },
      { userId: 'user_dr_patel', name: 'Dr. Amit Patel', priority: 2 },
    ],
    slotDuration: 60,
    slotBuffer: 15,
    availability: {
      monday: [{ start: '09:00', end: '16:00' }],
      tuesday: [{ start: '09:00', end: '16:00' }],
      wednesday: [{ start: '09:00', end: '12:00' }],
      thursday: [{ start: '09:00', end: '16:00' }],
      friday: [{ start: '09:00', end: '14:00' }],
    },
  },
  {
    id: 'cal_monitoring',
    locationId: 'loc_mock_fertility_clinic_01',
    name: 'Cycle Monitoring',
    description: 'Ultrasound & bloodwork monitoring appointment (30 min)',
    slug: 'cycle-monitoring',
    widgetType: 'classic',
    calendarType: 'round_robin',
    teamMembers: [
      { userId: 'user_dr_smith', name: 'Dr. Rebecca Smith', priority: 1 },
      { userId: 'user_dr_patel', name: 'Dr. Amit Patel', priority: 1 },
      { userId: 'user_nurse_jones', name: 'NP Sarah Jones', priority: 2 },
    ],
    slotDuration: 30,
    slotBuffer: 10,
    availability: {
      monday: [{ start: '07:00', end: '10:00' }],
      tuesday: [{ start: '07:00', end: '10:00' }],
      wednesday: [{ start: '07:00', end: '10:00' }],
      thursday: [{ start: '07:00', end: '10:00' }],
      friday: [{ start: '07:00', end: '10:00' }],
      saturday: [{ start: '07:00', end: '09:00' }],
    },
  },
  {
    id: 'cal_egg_retrieval',
    locationId: 'loc_mock_fertility_clinic_01',
    name: 'Egg Retrieval',
    description: 'Oocyte retrieval procedure (90 min block)',
    slug: 'egg-retrieval',
    widgetType: 'classic',
    calendarType: 'simple',
    teamMembers: [
      { userId: 'user_dr_smith', name: 'Dr. Rebecca Smith', priority: 1 },
    ],
    slotDuration: 90,
    slotBuffer: 30,
    availability: {
      monday: [{ start: '07:00', end: '12:00' }],
      tuesday: [{ start: '07:00', end: '12:00' }],
      wednesday: [{ start: '07:00', end: '12:00' }],
      thursday: [{ start: '07:00', end: '12:00' }],
      friday: [{ start: '07:00', end: '12:00' }],
    },
  },
  {
    id: 'cal_embryo_transfer',
    locationId: 'loc_mock_fertility_clinic_01',
    name: 'Embryo Transfer',
    description: 'Frozen or fresh embryo transfer (60 min block)',
    slug: 'embryo-transfer',
    widgetType: 'classic',
    calendarType: 'simple',
    teamMembers: [
      { userId: 'user_dr_patel', name: 'Dr. Amit Patel', priority: 1 },
    ],
    slotDuration: 60,
    slotBuffer: 30,
    availability: {
      monday: [{ start: '09:00', end: '14:00' }],
      tuesday: [{ start: '09:00', end: '14:00' }],
      wednesday: [{ start: '09:00', end: '14:00' }],
      thursday: [{ start: '09:00', end: '14:00' }],
      friday: [{ start: '09:00', end: '14:00' }],
    },
  },
  {
    id: 'cal_nurse_call',
    locationId: 'loc_mock_fertility_clinic_01',
    name: 'Nurse Phone Consultation',
    description: 'Phone call with fertility nurse for questions/results (15 min)',
    slug: 'nurse-phone-call',
    widgetType: 'classic',
    calendarType: 'round_robin',
    teamMembers: [
      { userId: 'user_nurse_jones', name: 'NP Sarah Jones', priority: 1 },
      { userId: 'user_nurse_kim', name: 'RN Lisa Kim', priority: 1 },
    ],
    slotDuration: 15,
    slotBuffer: 5,
    availability: {
      monday: [{ start: '10:00', end: '16:00' }],
      tuesday: [{ start: '10:00', end: '16:00' }],
      wednesday: [{ start: '10:00', end: '16:00' }],
      thursday: [{ start: '10:00', end: '16:00' }],
      friday: [{ start: '10:00', end: '14:00' }],
    },
  },
];

// Generate mock appointments
function generateAppointments() {
  const statuses = ['confirmed', 'pending', 'cancelled', 'completed'];
  const appointments = [];
  const now = new Date();

  for (let i = -5; i < 10; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    if (date.getDay() === 0) continue; // skip Sundays

    const cal = calendars[Math.floor(Math.random() * calendars.length)];
    const contact = require('./contacts')[Math.floor(Math.random() * 5)];

    appointments.push({
      id: uuidv4(),
      calendarId: cal.id,
      locationId: cal.locationId,
      contactId: contact.id,
      title: `${contact.firstName} ${contact.lastName} - ${cal.name}`,
      status: i < 0 ? 'completed' : statuses[Math.floor(Math.random() * 2)],
      startTime: new Date(date.setHours(9 + Math.floor(Math.random() * 6), 0, 0)).toISOString(),
      endTime: new Date(date.setHours(date.getHours(), date.getMinutes() + cal.slotDuration, 0)).toISOString(),
      assignedUserId: cal.teamMembers[0].userId,
      notes: i < 0 ? 'Appointment completed' : '',
    });
  }
  return appointments;
}

module.exports = { calendars, generateAppointments };
