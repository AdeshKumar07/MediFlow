import api from './api';

export const laboratoryService = {
  getLabTests: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const response = await api.get(`/laboratory?${params.toString()}`);
    return response.data;
  },

  getLabTestById: async (id) => {
    const response = await api.get(`/laboratory/${id}`);
    return response.data;
  },

  createLabTest: async (data) => {
    const response = await api.post('/laboratory', data);
    return response.data;
  },

  updateLabTest: async (id, data) => {
    const response = await api.put(`/laboratory/${id}`, data);
    return response.data;
  },

  deleteLabTest: async (id) => {
    const response = await api.delete(`/laboratory/${id}`);
    return response.data;
  },

  uploadReport: async (id, file) => {
    const formData = new FormData();
    formData.append('report', file);
    const response = await api.post(`/laboratory/${id}/upload`, formData);
    return response.data;
  },

  getPdfUrl: (id) => {
    return `/api/laboratory/${id}/pdf`;
  }
};
