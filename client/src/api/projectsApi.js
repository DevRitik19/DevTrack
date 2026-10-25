import api from './client';

export const projectsApi = {
  getProjects: async (params = {}) => {
    const res = await api.get('/projects', { params });
    return res.data;
  },
  getProjectById: async (id) => {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  },
  createProject: async (projectData) => {
    const res = await api.post('/projects', projectData);
    return res.data;
  },
  updateProject: async (id, projectData) => {
    const res = await api.patch(`/projects/${id}`, projectData);
    return res.data;
  },
  deleteProject: async (id) => {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  },
};
