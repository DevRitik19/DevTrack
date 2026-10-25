import React from 'react';
import { Badge } from '../common/Badge';
import { Edit2, Trash2, Plus, Minus, CheckCircle, Calendar } from 'lucide-react';

export const GoalCard = ({ goal, onEdit, onDelete, onUpdateProgress }) => {
  const percent = Math.min(
    100,
    Math.round((goal.currentValue / (goal.targetValue || 1)) * 100)
  );

  const isCompleted = goal.status === 'Completed' || percent >= 100;

  const handleIncrement = (amount) => {
    const newVal = Math.max(0, goal.currentValue + amount);
    onUpdateProgress(goal._id, newVal);
  };

  const getDaysRemaining = (targetDate) => {
    if (!targetDate) return null;
    const diff = new Date(targetDate) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    return `${days}d left`;
  };

  const daysRemaining = getDaysRemaining(goal.targetDate);

  return (
    <div className="devtrack-card p-5 flex flex-col justify-between group">
      <div>
        {/* Header: Title and Category */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge variant="purple" size="xs">
                {goal.category}
              </Badge>
              <span className="text-[11px] font-mono text-[#6E7167] bg-[#EAE2D3] px-2 py-0.5 rounded border border-[#E3D5BD]">
                {goal.targetType}
              </span>
              {isCompleted && (
                <Badge variant="success" size="xs" className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Done
                </Badge>
              )}
            </div>
            <h4 className="text-sm font-semibold text-[#263524] tracking-tight group-hover:text-[#B65F3B] transition-colors">
              {goal.title}
            </h4>
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(goal)}
              className="p-1.5 rounded-md text-[#6E7167] hover:text-[#263524] hover:bg-[#EAE2D3] transition-colors"
              title="Edit goal"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(goal)}
              className="p-1.5 rounded-md text-[#6E7167] hover:text-[#C24137] hover:bg-[#FDF2F0] transition-colors"
              title="Delete goal"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Description */}
        {goal.description && (
          <p className="text-xs text-[#6E7167] line-clamp-2 mb-3 leading-relaxed">
            {goal.description}
          </p>
        )}
      </div>

      {/* Progress Section */}
      <div className="pt-3 border-t border-[#E3D5BD] space-y-3">
        {/* Value counts and quick step controls */}
        <div className="flex items-center justify-between">
          <div className="font-mono text-xs">
            <span className="text-sm font-semibold text-[#292C25]">{goal.currentValue}</span>
            <span className="text-[#6E7167]"> / {goal.targetValue} {goal.unit}</span>
          </div>

          {/* Quick Increment buttons */}
          <div className="flex items-center gap-1 bg-[#EAE2D3] border border-[#E3D5BD] rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => handleIncrement(-1)}
              disabled={goal.currentValue <= 0}
              className="p-1 text-[#6E7167] hover:text-[#263524] disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-white transition-colors"
              title="Decrease by 1"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-1.5 text-[11px] font-mono text-[#B65F3B] font-semibold">
              {percent}%
            </span>
            <button
              type="button"
              onClick={() => handleIncrement(1)}
              className="p-1 text-[#6E7167] hover:text-[#263524] rounded hover:bg-white transition-colors"
              title="Increase by 1"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#EAE2D3] rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isCompleted
                ? 'bg-[#263524]'
                : percent > 50
                ? 'bg-[#B65F3B]'
                : 'bg-[#C27C2C]'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Target Date or Completed timestamp */}
        <div className="flex items-center justify-between text-[11px] text-[#6E7167] font-mono pt-1">
          {goal.targetDate ? (
            <span
              className={`flex items-center gap-1 ${
                daysRemaining === 'Overdue' ? 'text-[#C24137] font-semibold' : ''
              }`}
            >
              <Calendar className="w-3 h-3" />
              {daysRemaining} ({new Date(goal.targetDate).toLocaleDateString()})
            </span>
          ) : (
            <span>Continuous habit</span>
          )}

          {goal.completedAt && (
            <span className="text-[#263524] font-medium">
              Completed {new Date(goal.completedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
