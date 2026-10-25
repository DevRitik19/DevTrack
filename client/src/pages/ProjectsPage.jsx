import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi } from '../api/projectsApi';
import { useAuth } from '../context/AuthContext';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectModal } from '../components/projects/ProjectModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import { useToast } from '../context/ToastContext';
import {
  FolderGit2,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import { Github } from '../components/common/Icons';

export const ProjectsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters and search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('updated');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);

  // Confirm delete dialog state
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (sortBy) params.sort = sortBy;

      const res = await projectsApi.getProjects(params);
      if (res.success) {
        setProjects(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch projects', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sortBy, addToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchProjects]);

  const handleOpenCreate = () => {
    setProjectToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project) => {
    setProjectToEdit(project);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (project) => {
    setProjectToDelete(project);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      setDeleteLoading(true);
      const res = await projectsApi.deleteProject(projectToDelete._id);
      if (res.success) {
        addToast('Project deleted successfully', 'info');
        setProjects((prev) => prev.filter((p) => p._id !== projectToDelete._id));
        setProjectToDelete(null);
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete project', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#263524] flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-[#263524]" /> My Projects
          </h1>
          <p className="text-xs text-[#6E7167] mt-0.5 font-mono">
            Manage your development portfolio, build stages, and repositories
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {user?.githubUsername && (
            <Link
              to="/github"
              className="devtrack-btn-secondary text-xs flex items-center gap-1.5"
              title="Track repositories from your GitHub account"
            >
              <Github className="w-3.5 h-3.5 text-[#263524]" />
              <span>Import from GitHub</span>
            </Link>
          )}
          <button
            onClick={handleOpenCreate}
            className="devtrack-btn-primary flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="devtrack-card p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            className="devtrack-input devtrack-input-with-icon w-full pl-10 text-xs"
            placeholder="Search by title, description, or technology..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="w-4 h-4 text-[#8A8D83] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#8A8D83] shrink-0" />
          <select
            className="devtrack-input text-xs py-1.5 min-w-[140px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-[#8A8D83] shrink-0" />
          <select
            className="devtrack-input text-xs py-1.5 min-w-[150px]"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="updated">Recently Updated</option>
            <option value="newest">Newest Created</option>
            <option value="oldest">Oldest Created</option>
            <option value="progress_high">Progress: High to Low</option>
            <option value="progress_low">Progress: Low to High</option>
            <option value="title_asc">Title: A to Z</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="devtrack-card p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#EAE2D3] border border-[#E3D5BD] flex items-center justify-center text-[#6E7167]">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#263524]">No projects found</h3>
            <p className="text-xs text-[#6E7167] mt-1 max-w-sm">
              {search || statusFilter
                ? 'Try adjusting your filters or search keywords.'
                : 'Start tracking your software development projects, repositories, and completion milestones.'}
            </p>
          </div>
          {!search && !statusFilter && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button onClick={handleOpenCreate} className="devtrack-btn-primary text-xs">
                <Plus className="w-3.5 h-3.5" /> Create First Project
              </button>
              {user?.githubUsername && (
                <Link to="/github" className="devtrack-btn-secondary text-xs flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5 text-[#263524]" /> Track from GitHub
                </Link>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectToEdit={projectToEdit}
        onSaved={fetchProjects}
      />

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={Boolean(projectToDelete)}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete?.title}"? All associated data will be permanently removed.`}
        confirmText="Delete Project"
        isLoading={deleteLoading}
      />
    </div>
  );
};
