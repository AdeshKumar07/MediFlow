import api from './api';

export const getAnnouncements = async () => {
  const res = await api.get('/announcements');
  return res.data;
};

export const createAnnouncement = async (announcementData) => {
  const res = await api.post('/announcements', announcementData);
  return res.data;
};

export const deleteAnnouncement = async (id) => {
  const res = await api.delete(`/announcements/${id}`);
  return res.data;
};
