const Project = require('../models/Project');
const Goal = require('../models/Goal');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const { calculateStreaks } = require('./activityController');

// @desc    Get aggregated dashboard metrics for current user
// @route   GET /api/dashboard
// @access  Private
const getDashboardMetrics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch user for cached github and leetcode stats
    const user = await User.findById(userId);

    // 1. Projects stats
    const [totalProjects, completedProjects, inProgressProjects, plannedProjects] =
      await Promise.all([
        Project.countDocuments({ user: userId }),
        Project.countDocuments({ user: userId, status: 'Completed' }),
        Project.countDocuments({ user: userId, status: 'In Progress' }),
        Project.countDocuments({ user: userId, status: 'Planned' }),
      ]);

    const recentProjects = await Project.find({ user: userId })
      .sort({ updatedAt: -1 })
      .limit(5);

    // 2. Goals stats
    const [activeGoalsCount, completedGoalsCount, recentGoals] = await Promise.all([
      Goal.countDocuments({ user: userId, status: 'Active' }),
      Goal.countDocuments({ user: userId, status: 'Completed' }),
      Goal.find({ user: userId, status: 'Active' })
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    // 3. Activity and Streaks
    const allUserLogs = await ActivityLog.find({ user: userId }).sort({ date: 1 });
    const streakInfo = calculateStreaks(allUserLogs.map((l) => l.date));

    // Weekly activity chart (last 7 days)
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = daysOfWeek[d.getDay()];
      last7Days.push({
        date: dateStr,
        day: dayName,
        minutes: 0,
        hours: 0,
        sessions: 0,
      });
    }

    let weeklyMinutes = 0;
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    allUserLogs.forEach((log) => {
      const logDate = new Date(log.date);
      const logDateStr = logDate.toISOString().split('T')[0];

      const foundDay = last7Days.find((d) => d.date === logDateStr);
      if (foundDay) {
        foundDay.minutes += log.minutesSpent || 0;
        foundDay.hours = Math.round((foundDay.minutes / 60) * 10) / 10;
        foundDay.sessions += 1;
      }

      if (logDate >= sevenDaysAgo) {
        weeklyMinutes += log.minutesSpent || 0;
      }
    });

    // Heatmap data: map last 180 days activity
    const heatmapMap = {};
    allUserLogs.forEach((log) => {
      const dStr = new Date(log.date).toISOString().split('T')[0];
      if (!heatmapMap[dStr]) {
        heatmapMap[dStr] = { date: dStr, count: 0, minutes: 0 };
      }
      heatmapMap[dStr].count += 1;
      heatmapMap[dStr].minutes += log.minutesSpent || 0;
    });

    res.status(200).json({
      success: true,
      stats: {
        projects: {
          total: totalProjects,
          completed: completedProjects,
          inProgress: inProgressProjects,
          planned: plannedProjects,
          completionRate:
            totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0,
        },
        goals: {
          active: activeGoalsCount,
          completed: completedGoalsCount,
          total: activeGoalsCount + completedGoalsCount,
        },
        activity: {
          weeklyHours: Math.round((weeklyMinutes / 60) * 10) / 10,
          currentStreak: streakInfo.currentStreak,
          longestStreak: streakInfo.longestStreak,
          totalDaysActive: streakInfo.totalDaysActive,
        },
        github: {
          connected: Boolean(user.githubUsername),
          username: user.githubUsername || null,
        },
        leetcode: {
          totalSolved: user.leetcodeStats ? user.leetcodeStats.total || 0 : 0,
          easy: user.leetcodeStats ? user.leetcodeStats.easy || 0 : 0,
          medium: user.leetcodeStats ? user.leetcodeStats.medium || 0 : 0,
          hard: user.leetcodeStats ? user.leetcodeStats.hard || 0 : 0,
          ranking: user.leetcodeStats?.ranking || 0,
          avatar: user.leetcodeStats?.avatar || '',
          isUserReported: user.leetcodeStats?.isUserReported !== undefined ? user.leetcodeStats.isUserReported : true,
        },
      },
      weeklyChart: last7Days,
      heatmap: Object.values(heatmapMap),
      recentProjects,
      recentGoals,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardMetrics };
