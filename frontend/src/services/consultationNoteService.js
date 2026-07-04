import api from './api';

// Doctor → fetch thread with a patient
export const getDoctorPatientThread = async (patientId) => {
  const res = await api.get(`/notes/patient/${patientId}`);
  return res.data;
};

// Doctor → send note to patient
export const sendDoctorNote = async (patientId, message) => {
  const res = await api.post(`/notes/patient/${patientId}`, { message });
  return res.data;
};

// Doctor → inbox overview (all patient threads)
export const getDoctorInbox = async () => {
  const res = await api.get('/notes/inbox');
  return res.data;
};

// Patient → get all threads (by doctor)
export const getPatientThreads = async () => {
  const res = await api.get('/notes/my');
  return res.data;
};

// Patient → get thread with a specific doctor
export const getPatientDoctorThread = async (doctorId) => {
  const res = await api.get(`/notes/thread/${doctorId}`);
  return res.data;
};

// Patient → reply to doctor
export const sendPatientReply = async (doctorId, message) => {
  const res = await api.post(`/notes/reply/${doctorId}`, { message });
  return res.data;
};
