const ActivityLog = require('../models/ActivityLog');

// Helper to calculate streaks from an array of date objects/strings
const calculateStreaks = (dateList) => {
  if (!dateList || dateList.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalDaysActive: 0 };
  }

  // Get unique YYYY-MM-DD sorted ascending
  const uniqueDateStrings = Array.from(
    new Set(
      dateList.map((d) => {
        const dateObj = new Date(d);
        return dateObj.toISOString().split('T')[0];
      })
    )
  ).sort();

  const totalDaysActive = uniqueDateStrings.length;
  if (totalDaysActive === 0) {
    return { currentStreak: 0, longestStreak: 0, totalDaysActive: 0 };
  }

  // Calculate longest streak
  let longestStreak = 1;
  let runningStreak = 1;

  for (let i = 1; i < uniqueDateStrings.length; i++) {
    const prev = new Date(uniqueDateStrings[i - 1]);
    const curr = new Date(uniqueDateStrings[i]);
    const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      runningStreak += 1;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else if (diffDays > 1) {
      runningStreak = 1;
    }
  }

  // Calculate current streak
  // Current streak requires activity either today or yesterday
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const lastActiveStr = uniqueDateStrings[uniqueDateStrings.length - 1];

  let currentStreak = 0;
  if (lastActiveStr === todayStr || lastActiveStr === yesterdayStr) {
    currentStreak = 1;
    let expectedDate = new Date(lastActiveStr);

    for (let i = uniqueDateStrings.length - 2; i >= 0; i--) {
      expectedDate.setDate(expectedDate.getDate() - 1);
      const expectedStr = expectedDate.toISOString().split('T')[0];
      if (uniqueDateStrings[i] === expectedStr) {
        currentStreak += 1;
      } else {
        break;
      }
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    totalDaysActive,
  };
};

// @desc    Get activity logs and streak metrics
// @route   GET /api/activity
// @access  Private
const getActivityLogs = async (req, res, next) => {
  try {
    const { limit = 50, days = 90 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get logs for the user
    const logs = await ActivityLog.find({
      user: req.user._id,
      date: { $gte: startDate },
    })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .populate('project', 'title');

    // Get all user activity dates for full streak calculation
    const allUserLogs = await ActivityLog.find(
      { user: req.user._id },
      { date: 1, minutesSpent: 1 }
    ).sort({ date: 1 });

    const streakData = calculateStreaks(allUserLogs.map((l) => l.date));

    // Total hours logged
    const totalMinutes = allUserLogs.reduce((acc, curr) => acc + (curr.minutesSpent || 0), 0);

    // Group logs by date for heatmap (date -> count of minutes or sessions)
    const heatmap = {};
    allUserLogs.forEach((l) => {
      const dStr = new Date(l.date).toISOString().split('T')[0];
      if (!heatmap[dStr]) {
        heatmap[dStr] = { date: dStr, count: 0, minutes: 0 };
      }
      heatmap[dStr].count += 1;
      heatmap[dStr].minutes += l.minutesSpent || 0;
    });

    res.status(200).json({
      success: true,
      stats: {
        ...streakData,
        totalMinutes,
        totalHours: Math.round((totalMinutes / 60) * 10) / 10,
        totalSessions: allUserLogs.length,
      },
      heatmap: Object.values(heatmap),
      data: logs,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Log a new coding or learning session
// @route   POST /api/activity
// @access  Private
const createActivityLog = async (req, res, next) => {
  try {
    const {
      date,
      minutesSpent,
      type,
      description,
      project,
      problemTitle,
      problemDifficulty,
    } = req.body;

    const log = await ActivityLog.create({
      user: req.user._id,
      date: date ? new Date(date) : new Date(),
      minutesSpent: Number(minutesSpent) || 60,
      type: type || 'Coding',
      description: description || '',
      project: project || null,
      problemTitle: problemTitle || '',
      problemDifficulty: problemDifficulty || '',
    });

    res.status(201).json({
      success: true,
      message: 'Activity logged successfully',
      data: log,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getActivityLogs,
  createActivityLog,
  calculateStreaks,
};
