import api from './client';

export const dashboardApi = {
  getMetrics: async () => {
    const res = await api.get('/dashboard');
    return res.data;
  },
};
