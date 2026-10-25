const axios = require('axios');

// @desc    Fetch public GitHub profile and repositories for a username
// @route   GET /api/integrations/github/:username
// @access  Public (or Private)
const getGitHubData = async (req, res, next) => {
  try {
    const { username } = req.params;

    if (!username || username.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'GitHub username is required',
      });
    }

    const cleanUsername = username.trim();
    const headers = {
      'User-Agent': 'DevTrack-Developer-Progress-Hub',
      Accept: 'application/vnd.github.v3+json',
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    // Fetch user profile and repositories in parallel
    const [userRes, reposRes] = await Promise.allSettled([
      axios.get(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`, {
        headers,
        timeout: 8000,
      }),
      axios.get(
        `https://api.github.com/users/${encodeURIComponent(cleanUsername)}/repos?sort=updated&per_page=30`,
        {
          headers,
          timeout: 8000,
        }
      ),
    ]);

    // Handle user fetch failure
    if (userRes.status === 'rejected') {
      const err = userRes.reason;
      if (err.response && err.response.status === 404) {
        return res.status(404).json({
          success: false,
          message: `GitHub user '${cleanUsername}' was not found. Please verify the username.`,
        });
      }
      if (err.response && err.response.status === 401) {
        return res.status(502).json({
          success: false,
          message: 'GitHub API authentication failed. Please verify your GITHUB_TOKEN in server/.env or leave it blank for public queries.',
        });
      }
      if (err.response && err.response.status === 403) {
        const resetHeader = err.response.headers['x-ratelimit-reset'];
        const resetDate = resetHeader ? new Date(resetHeader * 1000).toLocaleTimeString() : 'later';
        return res.status(429).json({
          success: false,
          message: `GitHub API rate limit exceeded. Reset expected at ${resetDate}. Please try again later.`,
        });
      }
      return res.status(502).json({
        success: false,
        message: 'Failed to communicate with GitHub API. Please check your network connection.',
      });
    }

    const userData = userRes.value.data;
    const rateLimit = {
      limit: userRes.value.headers['x-ratelimit-limit'] || null,
      remaining: userRes.value.headers['x-ratelimit-remaining'] || null,
      reset: userRes.value.headers['x-ratelimit-reset']
        ? new Date(userRes.value.headers['x-ratelimit-reset'] * 1000).toISOString()
        : null,
    };

    let repos = [];
    if (reposRes.status === 'fulfilled') {
      repos = reposRes.value.data || [];
    }

    // Calculate aggregated repository metrics
    let totalStars = 0;
    let totalForks = 0;
    const languageCounts = {};

    const formattedRepos = repos.map((repo) => {
      const stars = repo.stargazers_count || 0;
      const forks = repo.forks_count || 0;
      totalStars += stars;
      totalForks += forks;

      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }

      return {
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description || 'No description provided',
        htmlUrl: repo.html_url,
        homepage: repo.homepage || '',
        language: repo.language || 'Plain Text',
        stars,
        forks,
        isFork: repo.fork,
        updatedAt: repo.updated_at,
        createdAt: repo.created_at,
      };
    });

    // Sort languages by frequency
    const topLanguages = Object.entries(languageCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / (repos.length || 1)) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    res.status(200).json({
      success: true,
      data: {
        profile: {
          username: userData.login,
          name: userData.name || userData.login,
          avatarUrl: userData.avatar_url,
          htmlUrl: userData.html_url,
          bio: userData.bio || '',
          location: userData.location || '',
          company: userData.company || '',
          blog: userData.blog || '',
          publicRepos: userData.public_repos,
          publicGists: userData.public_gists,
          followers: userData.followers,
          following: userData.following,
          createdAt: userData.created_at,
        },
        stats: {
          totalStars,
          totalForks,
          topLanguages,
          loadedReposCount: formattedRepos.length,
        },
        repositories: formattedRepos,
        rateLimit,
        isLive: true,
        lastRefreshed: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Helper function to fetch LeetCode user data from LeetCode public GraphQL API
const fetchLeetCodeProfile = async (username) => {
  const cleanUsername = username.trim();
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          ranking
          reputation
          userAvatar
          realName
          aboutMe
        }
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
      }
    }
  `;

  const response = await axios.post(
    'https://leetcode.com/graphql',
    {
      query,
      variables: { username: cleanUsername },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Referer: 'https://leetcode.com',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 10000,
    }
  );

  const matchedUser = response.data?.data?.matchedUser;
  if (!matchedUser) {
    const error = new Error(`LeetCode user '${cleanUsername}' was not found. Please verify your LeetCode username.`);
    error.statusCode = 404;
    throw error;
  }

  const acList = matchedUser.submitStats?.acSubmissionNum || [];
  const allObj = acList.find((i) => i.difficulty === 'All') || { count: 0, submissions: 0 };
  const easyObj = acList.find((i) => i.difficulty === 'Easy') || { count: 0, submissions: 0 };
  const mediumObj = acList.find((i) => i.difficulty === 'Medium') || { count: 0, submissions: 0 };
  const hardObj = acList.find((i) => i.difficulty === 'Hard') || { count: 0, submissions: 0 };

  return {
    username: matchedUser.username,
    profileUrl: `https://leetcode.com/u/${matchedUser.username}`,
    realName: matchedUser.profile?.realName || matchedUser.username,
    avatar: matchedUser.profile?.userAvatar || '',
    ranking: matchedUser.profile?.ranking || 0,
    reputation: matchedUser.profile?.reputation || 0,
    total: allObj.count,
    easy: easyObj.count,
    medium: mediumObj.count,
    hard: hardObj.count,
    totalSubmissions: allObj.submissions,
  };
};

// @desc    Fetch public LeetCode statistics and profile
// @route   GET /api/integrations/leetcode/:username
// @access  Public (or Private)
const getLeetCodeData = async (req, res, next) => {
  try {
    const { username } = req.params;

    if (!username || username.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'LeetCode username is required',
      });
    }

    const data = await fetchLeetCodeProfile(username);

    res.status(200).json({
      success: true,
      data: {
        ...data,
        isLive: true,
        lastRefreshed: new Date().toISOString(),
      },
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
      message: err.message || 'Failed to communicate with LeetCode API. Please check your network connection.',
    });
  }
};

module.exports = { getGitHubData, getLeetCodeData, fetchLeetCodeProfile };

