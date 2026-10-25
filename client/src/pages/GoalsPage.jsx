import React, { useState, useEffect, useCallback } from 'react';
import { goalsApi } from '../api/goalsApi';
import { activityApi } from '../api/activityApi';
import { GoalCard } from '../components/goals/GoalCard';
import { GoalModal } from '../components/goals/GoalModal';
import { ActivityLogModal } from '../components/goals/ActivityLogModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import { useToast } from '../context/ToastContext';
import {
  Target,
  Plus,
  Flame,
  Clock,
  Calendar,
  CheckCircle2,
  BookOpen,
  Filter,
} from 'lucide-react';

export const GoalsPage = () => {
  const { addToast } = useToast();
  const [goals, setGoals] = useState([]);
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('Active');
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState(null);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const [goalsRes, activityRes] = await Promise.all([
        goalsApi.getGoals(params),
        activityApi.getActivityLogs({ limit: 20 }),
      ]);

      if (goalsRes.success) setGoals(goalsRes.data);
      if (activityRes.success) setActivityData(activityRes);
    } catch (err) {
      addToast(err.message || 'Failed to load goals data', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenCreate = () => {
    setGoalToEdit(null);
    setIsGoalModalOpen(true);
  };

  const handleOpenEdit = (goal) => {
    setGoalToEdit(goal);
    setIsGoalModalOpen(true);
  };

  const handleOpenDelete = (goal) => {
    setGoalToDelete(goal);
  };

  const handleConfirmDelete = async () => {
    if (!goalToDelete) return;
    try {
      setDeleteLoading(true);
      const res = await goalsApi.deleteGoal(goalToDelete._id);
      if (res.success) {
        addToast('Goal removed', 'info');
        setGoals((prev) => prev.filter((g) => g._id !== goalToDelete._id));
        setGoalToDelete(null);
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete goal', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUpdateProgress = async (goalId, newCurrentValue) => {
    try {
      const res = await goalsApi.updateGoal(goalId, { currentValue: newCurrentValue });
      if (res.success) {
        setGoals((prev) =>
          prev.map((g) => (g._id === goalId ? res.data : g))
        );
        addToast('Goal progress updated', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to update progress', 'error');
    }
  };

  const stats = activityData?.stats || {
    currentStreak: 0,
    longestStreak: 0,
    totalHours: 0,
    totalSessions: 0,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#263524] flex items-center gap-2">
            <Target className="w-5 h-5 text-[#263524]" /> Goals & Learning Habits
          </h1>
          <p className="text-xs text-[#6E7167] mt-0.5 font-mono">
            Track coding milestones, problem-solving habits, and real-time streaks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsActivityModalOpen(true)}
            className="devtrack-btn-secondary text-xs"
          >
            <Clock className="w-3.5 h-3.5 text-[#263524]" />
            <span>Log Activity</span>
          </button>
          <button onClick={handleOpenCreate} className="devtrack-btn-primary text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Streak & Consistency Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="devtrack-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#FAF0E6] border border-[#EED7C8] flex items-center justify-center text-[#B65F3B] shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-[#263524]">
              {stats.currentStreak} Days
            </div>
            <div className="text-[11px] text-[#6E7167]">Current Streak</div>
          </div>
        </div>

        <div className="devtrack-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#EAF2E8] border border-[#BDD6B7] flex items-center justify-center text-[#263524] shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-[#263524]">
              {stats.longestStreak} Days
            </div>
            <div className="text-[11px] text-[#6E7167]">Best Streak Record</div>
          </div>
        </div>

        <div className="devtrack-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#E7EFF3] border border-[#C7D9E4] flex items-center justify-center text-[#2C5267] shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-[#263524]">
              {stats.totalHours} hrs
            </div>
            <div className="text-[11px] text-[#6E7167]">Total Time Logged</div>
          </div>
        </div>

        <div className="devtrack-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#F1ECE6] border border-[#DDD3C7] flex items-center justify-center text-[#6E4E37] shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-[#263524]">
              {stats.totalSessions}
            </div>
            <div className="text-[11px] text-[#6E7167]">Sessions Recorded</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-[#E3D5BD] pb-3">
        <div className="flex items-center gap-2">
          {['Active', 'Completed', ''].map((statusVal) => {
            const label = statusVal === '' ? 'All Goals' : statusVal;
            const isActive = statusFilter === statusVal;
            return (
              <button
                key={label}
                onClick={() => setStatusFilter(statusVal)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-[#263524] text-white shadow-sm'
                    : 'text-[#6E7167] hover:text-[#263524] hover:bg-[#EAE2D3]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <span className="text-xs font-mono text-[#6E7167]">
          Showing {goals.length} {statusFilter || 'total'} goals
        </span>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="devtrack-card p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#EAE2D3] border border-[#E3D5BD] flex items-center justify-center text-[#6E7167]">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#263524]">No goals in this view</h3>
            <p className="text-xs text-[#6E7167] mt-1 max-w-sm">
              Define your coding targets, practice milestones, or daily habits to keep your skills sharp.
            </p>
          </div>
          <button onClick={handleOpenCreate} className="devtrack-btn-primary text-xs">
            <Plus className="w-3.5 h-3.5" /> Create a Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((goal) => (
            <GoalCard
              key={goal._id}
              goal={goal}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onUpdateProgress={handleUpdateProgress}
            />
          ))}
        </div>
      )}

      {/* Recent Activity Log Table */}
      <div className="devtrack-card p-5 sm:p-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-[#263524] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#263524]" /> Recent Coding Sessions & Activity Logs
            </h2>
            <p className="text-xs text-[#6E7167] mt-0.5">
              Verified sessions stored in database driving your daily consistency score
            </p>
          </div>
          <button
            onClick={() => setIsActivityModalOpen(true)}
            className="text-xs font-mono text-[#B65F3B] hover:text-[#A3502E] font-medium flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Log Session
          </button>
        </div>

        {activityData?.data && activityData.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E3D5BD] text-[#6E7167] font-mono">
                  <th className="pb-2.5 font-medium">Date</th>
                  <th className="pb-2.5 font-medium">Type</th>
                  <th className="pb-2.5 font-medium">Duration</th>
                  <th className="pb-2.5 font-medium">Details</th>
                  <th className="pb-2.5 font-medium">Project</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3D5BD]">
                {activityData.data.map((log) => (
                  <tr key={log._id} className="hover:bg-[#FAF6EE] transition-colors">
                    <td className="py-2.5 font-mono text-[#6E7167]">
                      {new Date(log.date).toLocaleDateString()}
                    </td>
                    <td className="py-2.5">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#EAE2D3] text-[#263524] border border-[#E3D5BD]">
                        {log.type}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-[#263524] font-semibold">
                      {log.minutesSpent} mins ({Math.round((log.minutesSpent / 60) * 10) / 10}h)
                    </td>
                    <td className="py-2.5 text-[#292C25] max-w-xs truncate">
                      {log.problemTitle ? (
                        <span className="text-[#B65F3B] font-mono font-medium">
                          [{log.problemDifficulty || 'Problem'}] {log.problemTitle} —{' '}
                        </span>
                      ) : null}
                      {log.description || 'Session completed'}
                    </td>
                    <td className="py-2.5 text-[#6E7167] font-mono">
                      {log.project?.title || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-[#6E7167] font-mono">
            No activity sessions recorded yet. Log your first session today to start your streak!
          </div>
        )}
      </div>

      {/* Goal Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        goalToEdit={goalToEdit}
        onSaved={fetchData}
      />

      {/* Activity Log Modal */}
      <ActivityLogModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onLogged={fetchData}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={Boolean(goalToDelete)}
        onClose={() => setGoalToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Goal"
        message={`Are you sure you want to delete "${goalToDelete?.title}"?`}
        confirmText="Delete"
        isLoading={deleteLoading}
      />
    </div>
  );
};
