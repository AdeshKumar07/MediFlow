import api from './api';

export const getPatientList = (page = 1, limit = 10, search = '') => {
  return api.get(`/api/patients?page=${page}&limit=${limit}&search=${search}`);
};

export const getPatientDetails = (id) => {
  return api.get(`/api/patients/${id}`);
};

export const registerPatient = (userData, profileData) => {
  return api.post('/api/patients', { ...userData, ...profileData });
};

export const updatePatientProfile = (id, profileData) => {
  return api.put(`/api/patients/${id}`, profileData);
};
