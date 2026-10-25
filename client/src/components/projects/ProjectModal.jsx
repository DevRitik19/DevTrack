import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { projectsApi } from '../../api/projectsApi';
import { useToast } from '../../context/ToastContext';
import { X, Plus, ExternalLink, Globe } from 'lucide-react';
import { Github } from '../common/Icons';

export const ProjectModal = ({ isOpen, onClose, projectToEdit, onSaved }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [techInput, setTechInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: [],
    githubUrl: '',
    liveDemoUrl: '',
    status: 'Planned',
    completionPercentage: 0,
    isPublic: true,
  });

  useEffect(() => {
    if (projectToEdit) {
      setFormData({
        title: projectToEdit.title || '',
        description: projectToEdit.description || '',
        technologies: projectToEdit.technologies || [],
        githubUrl: projectToEdit.githubUrl || '',
        liveDemoUrl: projectToEdit.liveDemoUrl || '',
        status: projectToEdit.status || 'Planned',
        completionPercentage: projectToEdit.completionPercentage ?? 0,
        isPublic: projectToEdit.isPublic ?? true,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        technologies: ['React', 'Node.js', 'MongoDB'],
        githubUrl: '',
        liveDemoUrl: '',
        status: 'In Progress',
        completionPercentage: 25,
        isPublic: true,
      });
    }
  }, [projectToEdit, isOpen]);

  const handleAddTech = (e) => {
    e?.preventDefault();
    const trimmed = techInput.trim();
    if (trimmed && !formData.technologies.includes(trimmed)) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, trimmed],
      });
      setTechInput('');
    }
  };

  const handleRemoveTech = (techToRemove) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter((t) => t !== techToRemove),
    });
  };

  const handlePercentageChange = (val) => {
    const num = Math.min(100, Math.max(0, Number(val) || 0));
    let status = formData.status;
    if (num === 100) status = 'Completed';
    else if (num > 0 && status === 'Planned') status = 'In Progress';
    setFormData({
      ...formData,
      completionPercentage: num,
      status,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      addToast('Project title is required', 'error');
      return;
    }

    try {
      setLoading(true);
      if (projectToEdit) {
        const res = await projectsApi.updateProject(projectToEdit._id, formData);
        if (res.success) {
          addToast('Project updated successfully', 'success');
          onClose();
          if (onSaved) onSaved(res.data);
        }
      } else {
        const res = await projectsApi.createProject(formData);
        if (res.success) {
          addToast('Project created successfully', 'success');
          onClose();
          if (onSaved) onSaved(res.data);
        }
      }
    } catch (err) {
      addToast(err.message || 'Failed to save project', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={projectToEdit ? 'Edit Project' : 'Create New Project'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Project Title *
          </label>
          <input
            type="text"
            className="devtrack-input w-full"
            placeholder="e.g. Distributed Task Queue"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            maxLength={100}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Description
          </label>
          <textarea
            rows="3"
            className="devtrack-input w-full resize-none"
            placeholder="High-throughput asynchronous job processor built with Redis and Go..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            maxLength={1000}
          />
        </div>

        {/* Status and Progress */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Current Status
            </label>
            <select
              className="devtrack-input w-full"
              value={formData.status}
              onChange={(e) => {
                const newStatus = e.target.value;
                let pct = formData.completionPercentage;
                if (newStatus === 'Completed') pct = 100;
                else if (newStatus === 'Planned' && pct === 100) pct = 0;
                setFormData({ ...formData, status: newStatus, completionPercentage: pct });
              }}
            >
              <option value="Planned">Planned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-text-secondary">
                Completion Progress
              </label>
              <span className="text-xs font-mono text-[#B65F3B] font-semibold">
                {formData.completionPercentage}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.completionPercentage}
              onChange={(e) => handlePercentageChange(e.target.value)}
              className="w-full h-2 bg-[#EAE2D3] rounded-lg appearance-none cursor-pointer accent-[#B65F3B]"
            />
          </div>
        </div>

        {/* Technologies Tag Input */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Tech Stack / Technologies
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              className="devtrack-input flex-1 text-xs"
              placeholder="e.g. Next.js, Redis, Docker (Press Enter to add)"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTech();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddTech}
              className="devtrack-btn-secondary text-xs px-3"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          {/* Tag Chips */}
          <div className="flex flex-wrap gap-1.5 min-h-[28px]">
            {formData.technologies.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EAE2D3] text-[#292C25] text-xs font-mono rounded-md border border-[#E3D5BD]"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => handleRemoveTech(tech)}
                  className="text-text-secondary hover:text-[#C24137] p-0.5 rounded transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              GitHub Repository URL
            </label>
            <div className="relative">
              <input
                type="url"
                className="devtrack-input devtrack-input-with-icon w-full pl-10 text-xs"
                placeholder="https://github.com/..."
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              />
              <Github className="w-4 h-4 text-[#8A8D83] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Live Demo URL
            </label>
            <div className="relative">
              <input
                type="url"
                className="devtrack-input devtrack-input-with-icon w-full pl-10 text-xs"
                placeholder="https://demo.example.com"
                value={formData.liveDemoUrl}
                onChange={(e) => setFormData({ ...formData, liveDemoUrl: e.target.value })}
              />
              <ExternalLink className="w-4 h-4 text-[#8A8D83] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Visibility Setting */}
        <div className="flex items-center gap-2 p-3 bg-[#FAF6EE] border border-[#E3D5BD] rounded-lg">
          <input
            type="checkbox"
            id="isPublic"
            checked={formData.isPublic}
            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
            className="w-4 h-4 rounded bg-white border-[#E3D5BD] accent-[#B65F3B] cursor-pointer"
          />
          <label htmlFor="isPublic" className="text-xs text-text-secondary cursor-pointer">
            <span className="font-medium text-[#292C25]">Show on Public Developer Profile</span> — Allow this project to be viewed by anyone on your public profile link.
          </label>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E3D5BD]">
          <button type="button" onClick={onClose} className="devtrack-btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="devtrack-btn-primary">
            {loading ? 'Saving...' : projectToEdit ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
