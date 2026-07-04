import api from './api';

export const emrService = {
  createMedicalRecord: async (data) => {
    const response = await api.post('/emr', data);
    return response.data;
  },

  getMedicalRecords: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const response = await api.get(`/emr?${params.toString()}`);
    return response.data;
  },

  getMedicalRecordById: async (id) => {
    const response = await api.get(`/emr/${id}`);
    return response.data;
  },

  updateMedicalRecord: async (id, data) => {
    const response = await api.put(`/emr/${id}`, data);
    return response.data;
  }
};
