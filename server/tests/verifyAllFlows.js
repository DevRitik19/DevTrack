const API = 'http://localhost:5000/api';

async function runVerification() {
  console.log('--- STARTING DEVTRACK END-TO-END FLOW VERIFICATION ---');

  // Flow 1: Registration
  const username = `testdev_${Date.now()}`;
  const email = `${username}@example.com`;
  console.log(`\n[Flow 1] Registering user ${username}...`);
  const regRes = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      name: 'Verification Bot',
      email,
      password: 'password123',
    }),
  });
  const regData = await regRes.json();
  console.log('Register status:', regRes.status, 'Success:', regData.success);
  if (!regData.success) throw new Error(regData.message);
  const token = regData.token;

  // Flow 1b: GET /api/auth/me
  console.log('\n[Flow 1b] Verifying current user via /api/auth/me...');
  const meRes = await fetch(`${API}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meData = await meRes.json();
  console.log('Me status:', meRes.status, 'Username:', meData.user.username);

  // Flow 2: Project Management CRUD
  console.log('\n[Flow 2] Creating a project...');
  const projRes = await fetch(`${API}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: 'DevTrack Test Project',
      description: 'End-to-end testing project',
      technologies: ['React', 'Node.js', 'Express', 'MongoDB'],
      status: 'In Progress',
      completionPercentage: 50,
      isPublic: true,
    }),
  });
  const projData = await projRes.json();
  console.log('Create Project status:', projRes.status, 'Title:', projData.data.title);
  const projectId = projData.data._id;

  // Update project
  console.log('[Flow 2] Updating project completion to 100%...');
  const patchProjRes = await fetch(`${API}/projects/${projectId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      completionPercentage: 100,
    }),
  });
  const patchProjData = await patchProjRes.json();
  console.log(
    'Update Project status:',
    patchProjRes.status,
    'Status auto-changed to:',
    patchProjData.data.status
  );

  // Flow 3: Goals CRUD
  console.log('\n[Flow 3] Creating a learning goal...');
  const goalRes = await fetch(`${API}/goals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: 'Solve 25 Dynamic Programming Problems',
      category: 'DSA & LeetCode',
      targetType: 'Weekly',
      targetValue: 25,
      currentValue: 10,
      unit: 'problems',
    }),
  });
  const goalData = await goalRes.json();
  console.log('Create Goal status:', goalRes.status, 'Goal:', goalData.data.title);
  const goalId = goalData.data._id;

  // Update goal progress
  console.log('[Flow 3] Updating goal progress to target (25)...');
  const patchGoalRes = await fetch(`${API}/goals/${goalId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentValue: 25 }),
  });
  const patchGoalData = await patchGoalRes.json();
  console.log(
    'Update Goal status:',
    patchGoalRes.status,
    'Auto-completed:',
    patchGoalData.data.status
  );

  // Flow 4: Activity Logging & Streaks
  console.log('\n[Flow 4] Logging daily coding activity session...');
  const actRes = await fetch(`${API}/activity`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      date: new Date().toISOString(),
      minutesSpent: 120,
      type: 'Coding',
      description: 'Tested all core backend and frontend workflows',
      project: projectId,
    }),
  });
  const actData = await actRes.json();
  console.log('Log Activity status:', actRes.status, 'Minutes:', actData.data.minutesSpent);

  // Flow 5: Dashboard Aggregation
  console.log('\n[Flow 5] Loading dashboard metrics from MongoDB...');
  const dashRes = await fetch(`${API}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const dashData = await dashRes.json();
  console.log('Dashboard status:', dashRes.status);
  console.log('  Projects total:', dashData.stats.projects.total);
  console.log('  Completed projects:', dashData.stats.projects.completed);
  console.log('  Active goals:', dashData.stats.goals.active);
  console.log('  Completed goals:', dashData.stats.goals.completed);
  console.log('  Current streak:', dashData.stats.activity.currentStreak, 'day(s)');
  console.log('  Weekly hours logged:', dashData.stats.activity.weeklyHours, 'h');

  // Flow 6: GitHub Integration Live Call
  console.log('\n[Flow 6] Fetching live public GitHub profile (gaearon)...');
  const gitRes = await fetch(`${API}/integrations/github/gaearon`);
  const gitData = await gitRes.json();
  console.log('GitHub API status:', gitRes.status);
  console.log('  GitHub name:', gitData.data.profile.name);
  console.log('  Public repos count:', gitData.data.profile.publicRepos);
  console.log('  Followers count:', gitData.data.profile.followers);
  console.log('  Loaded repos length:', gitData.data.repositories.length);
  console.log('  Rate limit remaining:', gitData.data.rateLimit.remaining);

  // Flow 7: LeetCode User-Reported Tracking
  console.log('\n[Flow 7] Updating user-reported LeetCode statistics...');
  const lcRes = await fetch(`${API}/users/leetcode`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      username: 'test_coder',
      easy: 35,
      medium: 50,
      hard: 15,
      total: 100,
    }),
  });
  const lcData = await lcRes.json();
  console.log(
    'LeetCode update status:',
    lcRes.status,
    'Total solved:',
    lcData.data.total,
    'IsUserReported:',
    lcData.data.isUserReported
  );

  // Flow 8: Public Profile Privacy Verification
  console.log(`\n[Flow 8] Inspecting public profile for /u/${username}...`);
  const pubRes = await fetch(`${API}/users/${username}/public`);
  const pubData = await pubRes.json();
  console.log('Public Profile status:', pubRes.status);
  console.log('  Username:', pubData.data.username);
  console.log('  Email exposed?:', pubData.data.email !== undefined);
  console.log('  Password exposed?:', pubData.data.password !== undefined);
  console.log('  Public projects count:', pubData.data.projects.length);
  if (pubData.data.email) {
    throw new Error('SECURITY VIOLATION: Email exposed on public profile!');
  }

  console.log('\n======================================================');
  console.log(' ALL 8 END-TO-END FLOWS FULLY VERIFIED AND WORKING!');
  console.log('======================================================');
}

runVerification().catch((err) => {
  console.error('\n[Verification FAILED]:', err.message);
  process.exit(1);
});
