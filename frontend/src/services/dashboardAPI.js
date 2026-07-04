import api from './api';

const dashboardAPI = {
  // ─── Admin ───────────────────────────────────────────────────────────
  getAdminStats: () => api.get('/dashboard/admin'),
  getAdminCharts: (period = '6m') => api.get(`/dashboard/admin/charts?period=${period}`),

  // ─── Doctor ──────────────────────────────────────────────────────────
  getDoctorStats: () => api.get('/dashboard/doctor'),
  getDoctorCharts: (period = '30d') => api.get(`/dashboard/doctor/charts?period=${period}`),

  // ─── Receptionist ────────────────────────────────────────────────────
  getReceptionistStats: () => api.get('/dashboard/receptionist'),
  getReceptionistCharts: (period = '30d') => api.get(`/dashboard/receptionist/charts?period=${period}`),

  // ─── Reports ─────────────────────────────────────────────────────────
  getRevenueReport: (params = {}) =>
    api.get('/dashboard/reports/revenue', { params }),
  getPatientReport: (params = {}) =>
    api.get('/dashboard/reports/patients', { params }),
  getAppointmentReport: (params = {}) =>
    api.get('/dashboard/reports/appointments', { params }),
};

export default dashboardAPI;
