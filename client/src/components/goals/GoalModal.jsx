import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { goalsApi } from '../../api/goalsApi';
import { useToast } from '../../context/ToastContext';

export const GoalModal = ({ isOpen, onClose, goalToEdit, onSaved }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    targetType: 'Weekly',
    targetValue: 10,
    currentValue: 0,
    unit: 'hours',
    targetDate: '',
  });

  useEffect(() => {
    if (goalToEdit) {
      setFormData({
        title: goalToEdit.title || '',
        description: goalToEdit.description || '',
        category: goalToEdit.category || 'General',
        targetType: goalToEdit.targetType || 'Weekly',
        targetValue: goalToEdit.targetValue || 10,
        currentValue: goalToEdit.currentValue || 0,
        unit: goalToEdit.unit || 'hours',
        targetDate: goalToEdit.targetDate
          ? new Date(goalToEdit.targetDate).toISOString().split('T')[0]
          : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'DSA & LeetCode',
        targetType: 'Weekly',
        targetValue: 15,
        currentValue: 0,
        unit: 'problems',
        targetDate: '',
      });
    }
  }, [goalToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      addToast('Goal title is required', 'error');
      return;
    }
    if (!formData.targetValue || Number(formData.targetValue) <= 0) {
      addToast('Target value must be greater than 0', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        targetValue: Number(formData.targetValue),
        currentValue: Number(formData.currentValue) || 0,
        targetDate: formData.targetDate || null,
      };

      if (goalToEdit) {
        const res = await goalsApi.updateGoal(goalToEdit._id, payload);
        if (res.success) {
          addToast('Goal updated successfully', 'success');
          onClose();
          if (onSaved) onSaved(res.data);
        }
      } else {
        const res = await goalsApi.createGoal(payload);
        if (res.success) {
          addToast('Goal created successfully', 'success');
          onClose();
          if (onSaved) onSaved(res.data);
        }
      }
    } catch (err) {
      addToast(err.message || 'Failed to save goal', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goalToEdit ? 'Edit Learning Goal' : 'Create New Learning Goal'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Goal Title *
          </label>
          <input
            type="text"
            className="devtrack-input w-full"
            placeholder="e.g. Solve 30 Graph and Tree problems"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            maxLength={120}
          />
        </div>

        {/* Category & Cadence */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Category
            </label>
            <select
              className="devtrack-input w-full"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="DSA & LeetCode">DSA & LeetCode</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Full Stack">Full Stack</option>
              <option value="DevOps">DevOps</option>
              <option value="System Design">System Design</option>
              <option value="General">General</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Target Frequency
            </label>
            <select
              className="devtrack-input w-full"
              value={formData.targetType}
              onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
            >
              <option value="Daily">Daily Target</option>
              <option value="Weekly">Weekly Target</option>
              <option value="Target Date">Target Date / Milestone</option>
              <option value="Milestone">Ongoing Milestone</option>
            </select>
          </div>
        </div>

        {/* Target, Current, and Unit */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Target *
            </label>
            <input
              type="number"
              min="1"
              className="devtrack-input w-full font-mono"
              value={formData.targetValue}
              onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Current
            </label>
            <input
              type="number"
              min="0"
              className="devtrack-input w-full font-mono"
              value={formData.currentValue}
              onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Unit
            </label>
            <select
              className="devtrack-input w-full"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            >
              <option value="problems">problems</option>
              <option value="hours">hours</option>
              <option value="commits">commits</option>
              <option value="lessons">lessons</option>
              <option value="tasks">tasks</option>
              <option value="days">days</option>
            </select>
          </div>
        </div>

        {/* Target Deadline */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Target Completion Date (Optional)
          </label>
          <input
            type="date"
            className="devtrack-input w-full"
            value={formData.targetDate}
            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Description / Strategy
          </label>
          <textarea
            rows="2"
            className="devtrack-input w-full resize-none"
            placeholder="Focus on BFS, DFS, and Union-Find patterns from NeetCode 150..."
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
            {loading ? 'Saving...' : goalToEdit ? 'Save Changes' : 'Create Goal'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
