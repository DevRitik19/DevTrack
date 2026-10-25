import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { activityApi } from '../../api/activityApi';
import { projectsApi } from '../../api/projectsApi';
import { useToast } from '../../context/ToastContext';
import { Clock, BookOpen, Code2 } from 'lucide-react';

export const ActivityLogModal = ({ isOpen, onClose, onLogged }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    minutesSpent: 60,
    type: 'Coding',
    description: '',
    project: '',
    problemTitle: '',
    problemDifficulty: '',
  });

  useEffect(() => {
    if (isOpen) {
      projectsApi
        .getProjects()
        .then((res) => {
          if (res.success) setProjects(res.data);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.minutesSpent || Number(formData.minutesSpent) <= 0) {
      addToast('Please enter a valid time spent in minutes', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        minutesSpent: Number(formData.minutesSpent),
        project: formData.project || null,
      };

      const res = await activityApi.createActivityLog(payload);
      if (res.success) {
        addToast('Activity logged successfully! Streak updated.', 'success');
        onClose();
        if (onLogged) onLogged(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to log activity', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Daily Coding Activity">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date and Minutes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Activity Date *
            </label>
            <input
              type="date"
              className="devtrack-input w-full"
              value={formData.date}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Time Spent (Minutes) *
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="1440"
                className="devtrack-input w-full pr-12"
                placeholder="60"
                value={formData.minutesSpent}
                onChange={(e) => setFormData({ ...formData, minutesSpent: e.target.value })}
                required
              />
              <span className="absolute right-3 top-2.5 text-xs text-text-muted font-mono">
                {Math.round((formData.minutesSpent / 60) * 10) / 10}h
              </span>
            </div>
          </div>
        </div>

        {/* Activity Type */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Activity Type
          </label>
          <select
            className="devtrack-input w-full"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="Coding">Coding & Building</option>
            <option value="LeetCode Practice">LeetCode / Problem Solving</option>
            <option value="Learning">Learning & Tutorials</option>
            <option value="Project Work">Project Work</option>
            <option value="Bug Fix">Bug Fixing</option>
            <option value="System Design">System Design</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Project Link (optional) */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Associate with Project (Optional)
          </label>
          <select
            className="devtrack-input w-full"
            value={formData.project}
            onChange={(e) => setFormData({ ...formData, project: e.target.value })}
          >
            <option value="">None / General Activity</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title} ({p.status})
              </option>
            ))}
          </select>
        </div>

        {/* LeetCode Details if type is LeetCode Practice */}
        {formData.type === 'LeetCode Practice' && (
          <div className="p-3 bg-[#FAF6EE] border border-[#E3D5BD] rounded-lg space-y-3">
            <span className="text-xs font-semibold text-[#263524] flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-[#B65F3B]" /> LeetCode Problem Details
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Problem title (e.g. Two Sum)"
                className="devtrack-input w-full text-xs"
                value={formData.problemTitle}
                onChange={(e) => setFormData({ ...formData, problemTitle: e.target.value })}
              />
              <select
                className="devtrack-input w-full text-xs"
                value={formData.problemDifficulty}
                onChange={(e) => setFormData({ ...formData, problemDifficulty: e.target.value })}
              >
                <option value="">Difficulty (Optional)</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
        )}

        {/* Notes / Description */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Notes / What did you accomplish?
          </label>
          <textarea
            rows="3"
            className="devtrack-input w-full resize-none"
            placeholder="Implemented JWT auth middleware, fixed token expiration bug..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E3D5BD]">
          <button type="button" onClick={onClose} className="devtrack-btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="devtrack-btn-primary">
            {loading ? 'Saving...' : 'Save Activity'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
