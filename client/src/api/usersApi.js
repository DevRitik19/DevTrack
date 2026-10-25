import api from './client';

export const usersApi = {
  getPublicProfile: async (username) => {
    const res = await api.get(`/users/${username}/public`);
    return res.data;
  },
  updateProfile: async (profileData) => {
    const res = await api.patch('/users/profile', profileData);
    return res.data;
  },
  updateLeetCodeStats: async (statsData) => {
    const res = await api.patch('/users/leetcode', statsData);
    return res.data;
  },
  syncLeetCodeStats: async (username) => {
    const res = await api.post('/users/leetcode/sync', { username });
    return res.data;
  },
  updatePassword: async (passwordData) => {
    const res = await api.patch('/users/password', passwordData);
    return res.data;
  },
};
