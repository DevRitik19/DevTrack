const User = require('../models/User');
const Project = require('../models/Project');

// @desc    Get public developer profile by username
// @route   GET /api/users/:username/public
// @access  Public
const getPublicProfile = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({
      username: username.toLowerCase().trim(),
    }).select('-password -email -__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Developer profile not found',
      });
    }

    if (!user.publicProfileSettings.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'This developer profile is set to private',
      });
    }

    // Fetch ONLY public projects
    const publicProjects = await Project.find({
      user: user._id,
      isPublic: true,
    })
      .select('title description technologies githubUrl liveDemoUrl status completionPercentage createdAt')
      .sort({ updatedAt: -1 });

    // Sanitize output strictly according to privacy specifications
    const publicProfile = {
      username: user.username,
      name: user.name || user.username,
      bio: user.bio || '',
      avatarUrl: user.avatarUrl || '',
      skills: user.publicProfileSettings.showSkills ? user.skills : [],
      github: user.publicProfileSettings.showGitHub && user.githubUsername ? {
        username: user.githubUsername,
        profileUrl: `https://github.com/${user.githubUsername}`,
      } : null,
      leetcode: user.publicProfileSettings.showLeetCode && user.leetcodeStats && user.leetcodeStats.username ? {
        username: user.leetcodeStats.username,
        profileUrl: user.leetcodeStats.profileUrl || `https://leetcode.com/${user.leetcodeStats.username}`,
        total: user.leetcodeStats.total || 0,
        easy: user.leetcodeStats.easy || 0,
        medium: user.leetcodeStats.medium || 0,
        hard: user.leetcodeStats.hard || 0,
        isUserReported: true,
      } : null,
      projects: publicProjects,
      stats: {
        totalPublicProjects: publicProjects.length,
        completedProjects: publicProjects.filter((p) => p.status === 'Completed').length,
      },
      joinedAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      data: publicProfile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update current user's profile details
// @route   PATCH /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    const {
      name,
      bio,
      avatarUrl,
      skills,
      githubUsername,
      publicProfileSettings,
    } = req.body;

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (skills !== undefined) user.skills = Array.isArray(skills) ? skills : [];
    if (githubUsername !== undefined) user.githubUsername = githubUsername.trim();
    if (publicProfileSettings !== undefined) {
      user.publicProfileSettings = {
        ...user.publicProfileSettings,
        ...publicProfileSettings,
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        skills: user.skills,
        githubUsername: user.githubUsername,
        leetcodeStats: user.leetcodeStats,
        publicProfileSettings: user.publicProfileSettings,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Save/update user-reported LeetCode statistics
// @route   PATCH /api/users/leetcode
// @access  Private
const updateLeetCodeStats = async (req, res, next) => {
  try {
    const { username, profileUrl, easy = 0, medium = 0, hard = 0, total } = req.body;

    const user = await User.findById(req.user._id);

    const parsedEasy = Number(easy) || 0;
    const parsedMedium = Number(medium) || 0;
    const parsedHard = Number(hard) || 0;
    const computedTotal = parsedEasy + parsedMedium + parsedHard;
    const finalTotal = total !== undefined && Number(total) >= computedTotal ? Number(total) : computedTotal;

    user.leetcodeStats = {
      username: username ? username.trim() : user.leetcodeStats?.username || '',
      profileUrl: profileUrl ? profileUrl.trim() : (username ? `https://leetcode.com/${username.trim()}` : ''),
      easy: parsedEasy,
      medium: parsedMedium,
      hard: parsedHard,
      total: finalTotal,
      ranking: req.body.ranking !== undefined ? Number(req.body.ranking) : user.leetcodeStats?.ranking || 0,
      avatar: req.body.avatar || user.leetcodeStats?.avatar || '',
      lastUpdated: new Date(),
      isUserReported: req.body.isUserReported !== undefined ? Boolean(req.body.isUserReported) : true,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'LeetCode statistics updated successfully',
      data: user.leetcodeStats,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Automatically fetch and sync live LeetCode statistics
// @route   POST /api/users/leetcode/sync
// @access  Private
const syncLeetCodeStats = async (req, res, next) => {
  try {
    const { fetchLeetCodeProfile } = require('./integrationController');
    const user = await User.findById(req.user._id);
    const targetUsername = req.body.username?.trim() || user.leetcodeStats?.username?.trim();

    if (!targetUsername) {
      return res.status(400).json({
        success: false,
        message: 'LeetCode username is required to sync statistics',
      });
    }

    const lcData = await fetchLeetCodeProfile(targetUsername);

    user.leetcodeStats = {
      username: lcData.username,
      profileUrl: lcData.profileUrl,
      easy: lcData.easy,
      medium: lcData.medium,
      hard: lcData.hard,
      total: lcData.total,
      ranking: lcData.ranking,
      avatar: lcData.avatar,
      lastUpdated: new Date(),
      isUserReported: false,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: `Successfully synchronized ${lcData.total} solved problems from LeetCode!`,
      data: user.leetcodeStats,
    });
  } catch (err) {
    if (err.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: err.message,
      });
    }
    return res.status(502).json({
      success: false,
      message: err.message || 'Failed to sync with LeetCode API. Please check the username.',
    });
  }
};

// @desc    Change password
// @route   PATCH /api/users/password
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPublicProfile,
  updateProfile,
  updateLeetCodeStats,
  syncLeetCodeStats,
  updatePassword,
};

