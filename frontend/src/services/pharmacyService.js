import api from './api';

export const pharmacyService = {
  getMedicines: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const response = await api.get(`/pharmacy?${params.toString()}`);
    return response.data;
  },

  getMedicineById: async (id) => {
    const response = await api.get(`/pharmacy/${id}`);
    return response.data;
  },

  createMedicine: async (data) => {
    const response = await api.post('/pharmacy', data);
    return response.data;
  },

  updateMedicine: async (id, data) => {
    const response = await api.put(`/pharmacy/${id}`, data);
    return response.data;
  },

  deleteMedicine: async (id) => {
    const response = await api.delete(`/pharmacy/${id}`);
    return response.data;
  },

  getPrescriptions: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const response = await api.get(`/pharmacy/prescriptions?${params.toString()}`);
    return response.data;
  },

  dispenseMedicine: async (recordId, medicineId) => {
    const response = await api.post(`/pharmacy/dispense/${recordId}/${medicineId}`);
    return response.data;
  }
};
