import api from './client';

export const activityApi = {
  getActivityLogs: async (params = {}) => {
    const res = await api.get('/activity', { params });
    return res.data;
  },
  createActivityLog: async (logData) => {
    const res = await api.post('/activity', logData);
    return res.data;
  },
};
