import api from './api';

export const appointmentService = {
  bookAppointment: async (data) => {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  getAppointments: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const response = await api.get(`/appointments?${params.toString()}`);
    return response.data;
  },

  getAppointmentById: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  updateAppointmentStatus: async (id, status, notes) => {
    const response = await api.patch(`/appointments/${id}/status`, { status, notes });
    return response.data;
  },

  rescheduleAppointment: async (id, date, timeSlot) => {
    const response = await api.patch(`/appointments/${id}/reschedule`, { date, timeSlot });
    return response.data;
  },

  // Availability endpoints
  getAvailabilities: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined) params.append(key, filters[key]);
    });
    const response = await api.get(`/availability?${params.toString()}`);
    return response.data;
  },

  setAvailability: async (data) => {
    const response = await api.post('/availability', data);
    return response.data;
  }
};
