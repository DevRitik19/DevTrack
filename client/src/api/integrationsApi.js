import api from './client';

export const integrationsApi = {
  getGitHubData: async (username) => {
    const res = await api.get(`/integrations/github/${username}`);
    return res.data;
  },
  getLeetCodeData: async (username) => {
    const res = await api.get(`/integrations/leetcode/${username}`);
    return res.data;
  },
};
