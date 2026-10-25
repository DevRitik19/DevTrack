import api from './client';

export const goalsApi = {
  getGoals: async (params = {}) => {
    const res = await api.get('/goals', { params });
    return res.data;
  },
  createGoal: async (goalData) => {
    const res = await api.post('/goals', goalData);
    return res.data;
  },
  updateGoal: async (id, goalData) => {
    const res = await api.patch(`/goals/${id}`, goalData);
    return res.data;
  },
  deleteGoal: async (id) => {
    const res = await api.delete(`/goals/${id}`);
    return res.data;
  },
};
