import api from './api';

export const getHospitalProfile = async () => {
  const response = await api.get('/hospital');
  return response.data;
};

export const updateHospitalProfile = async (data) => {
  const response = await api.put('/hospital', data);
  return response.data;
};

export const getBranches = async (page = 1, limit = 10, search = '', isActive = '') => {
  const response = await api.get(`/hospital/branches?page=${page}&limit=${limit}&search=${search}&isActive=${isActive}`);
  return response.data;
};

export const createBranch = async (data) => {
  const response = await api.post('/hospital/branches', data);
  return response.data;
};

export const updateBranch = async (id, data) => {
  const response = await api.put(`/hospital/branches/${id}`, data);
  return response.data;
};

export const getDepartments = async (page = 1, limit = 10, search = '') => {
  const response = await api.get(`/hospital/departments?page=${page}&limit=${limit}&search=${search}`);
  return response.data;
};

export const createDepartment = async (data) => {
  const response = await api.post('/hospital/departments', data);
  return response.data;
};

export const updateDepartment = async (id, data) => {
  const response = await api.put(`/hospital/departments/${id}`, data);
  return response.data;
};
