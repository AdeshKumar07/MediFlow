import api from './api';

export const getStaffList = async (page = 1, limit = 10, search = '', role = '', isActive = '') => {
  const response = await api.get(`/staff?page=${page}&limit=${limit}&search=${search}&role=${role}&isActive=${isActive}`);
  return response.data;
};

export const getStaffDetails = async (id) => {
  const response = await api.get(`/staff/${id}`);
  return response.data;
};

export const createStaff = async (userData, profileData) => {
  const response = await api.post('/staff', { userData, profileData });
  return response.data;
};

export const updateStaffProfile = async (id, data) => {
  const response = await api.put(`/staff/${id}`, data);
  return response.data;
};

export const toggleStaffStatus = async (id, isActive) => {
  const response = await api.put(`/staff/${id}`, { isActive });
  return response.data;
};
