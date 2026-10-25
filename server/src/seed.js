const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Project = require('./models/Project');
const Goal = require('./models/Goal');
const ActivityLog = require('./models/ActivityLog');
const { connectDB, disconnectDB } = require('./config/db');

const populateDemoData = async () => {
  // Remove existing demo user if exists
  const existingDemo = await User.findOne({ email: 'demo@devtrack.io' });
  if (existingDemo) {
    await Project.deleteMany({ user: existingDemo._id });
    await Goal.deleteMany({ user: existingDemo._id });
    await ActivityLog.deleteMany({ user: existingDemo._id });
    await User.deleteOne({ _id: existingDemo._id });
  }

    // Create Demo User
    const demoUser = await User.create({
      username: 'alex_rivera',
      email: 'demo@devtrack.io',
      password: 'password123',
      name: 'Alex Rivera',
      bio: 'Full-stack software architect specializing in distributed cloud systems, modern React applications, and algorithm design.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      skills: ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'Tailwind CSS', 'Docker', 'Redis'],
      githubUsername: 'gaearon',
      leetcodeStats: {
        username: 'alex_dev',
        profileUrl: 'https://leetcode.com/alex_dev',
        easy: 95,
        medium: 115,
        hard: 30,
        total: 240,
        lastUpdated: new Date(),
        isUserReported: true,
      },
      publicProfileSettings: {
        isPublic: true,
        showLeetCode: true,
        showGitHub: true,
        showSkills: true,
      },
    });

    console.log(`[Seed] Created user: ${demoUser.username} (${demoUser.email})`);

    // Create Projects
    const projects = await Project.create([
      {
        user: demoUser._id,
        title: 'DevTrack — Developer Progress Hub',
        description: 'Comprehensive MERN platform for software developers tracking learning goals, real GitHub activity, LeetCode milestones, and project pipelines.',
        technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'Recharts'],
        githubUrl: 'https://github.com/alex_rivera/devtrack-hub',
        liveDemoUrl: 'http://localhost:5173',
        status: 'Completed',
        completionPercentage: 100,
        isPublic: true,
      },
      {
        user: demoUser._id,
        title: 'Distributed In-Memory Task Queue',
        description: 'Fault-tolerant job orchestrator implementing Raft consensus, priority queues, and dead-letter queues with sub-millisecond dispatch times.',
        technologies: ['Go', 'Redis', 'Docker', 'gRPC', 'Prometheus'],
        githubUrl: 'https://github.com/alex_rivera/distributed-queue',
        liveDemoUrl: '',
        status: 'In Progress',
        completionPercentage: 75,
        isPublic: true,
      },
      {
        user: demoUser._id,
        title: 'Collaborative Markdown & Canvas Studio',
        description: 'Real-time collaborative workspace powered by Conflict-Free Replicated Data Types (CRDTs) and WebSockets with instant peer synchronization.',
        technologies: ['TypeScript', 'Next.js', 'WebSockets', 'Canvas API'],
        githubUrl: 'https://github.com/alex_rivera/collab-studio',
        liveDemoUrl: '',
        status: 'Planned',
        completionPercentage: 20,
        isPublic: true,
      },
      {
        user: demoUser._id,
        title: 'Internal Infrastructure Terraform Modules',
        description: 'Reusable secure infrastructure-as-code modules for VPC peering, managed Kubernetes clusters, and automated blue-green deployments.',
        technologies: ['Terraform', 'AWS', 'Kubernetes', 'Bash'],
        githubUrl: '',
        liveDemoUrl: '',
        status: 'In Progress',
        completionPercentage: 50,
        isPublic: false, // Private project to verify privacy boundary
      },
    ]);

    console.log(`[Seed] Created ${projects.length} sample projects`);

    // Create Goals
    const goals = await Goal.create([
      {
        user: demoUser._id,
        title: 'Solve 50 Advanced Graph & DP Problems',
        description: 'Master topological sort, Dijkstra, Floyd-Warshall, and multidimensional dynamic programming.',
        category: 'DSA & LeetCode',
        targetType: 'Weekly',
        targetValue: 50,
        currentValue: 38,
        unit: 'problems',
        targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'Active',
      },
      {
        user: demoUser._id,
        title: '30 Hours of Production Coding & Architecture',
        description: 'Dedicate deep work blocks to backend refactoring and building robust unit test suites.',
        category: 'Full Stack',
        targetType: 'Weekly',
        targetValue: 30,
        currentValue: 22,
        unit: 'hours',
        targetDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'Active',
      },
      {
        user: demoUser._id,
        title: 'Kubernetes CKAD Certification Preparation',
        description: 'Work through interactive Kubernetes labs covering Pods, Deployments, Services, and Network Policies.',
        category: 'DevOps',
        targetType: 'Target Date',
        targetValue: 15,
        currentValue: 15,
        unit: 'lessons',
        targetDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'Completed',
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log(`[Seed] Created ${goals.length} sample goals`);

    // Create Activity Logs across consecutive recent days to build an authentic active streak
    const activityLogs = [];
    const now = new Date();

    for (let i = 0; i < 7; i++) {
      const logDate = new Date(now);
      logDate.setDate(now.getDate() - i);

      activityLogs.push({
        user: demoUser._id,
        date: logDate,
        minutesSpent: i % 2 === 0 ? 120 : 90,
        type: i % 3 === 0 ? 'LeetCode Practice' : 'Coding',
        description:
          i % 3 === 0
            ? 'Solved Graph BFS and Dynamic Programming problems on LeetCode'
            : 'Implemented authentication middleware, REST endpoints, and UI dashboard',
        project: projects[0]._id,
        problemTitle: i % 3 === 0 ? 'Course Schedule II' : '',
        problemDifficulty: i % 3 === 0 ? 'Medium' : '',
      });
    }

    await ActivityLog.insertMany(activityLogs);
    console.log(`[Seed] Created ${activityLogs.length} consecutive activity sessions for current streak.`);

    return demoUser;
};

const seedDemoData = async () => {
  try {
    await connectDB();
    console.log('[Seed] Connected to database. Seeding demo data...');
    await populateDemoData();
    console.log('[Seed] Demo database seeding completed successfully!');
    console.log('Demo Credentials:');
    console.log('  Email:    demo@devtrack.io');
    console.log('  Password: password123');
    console.log('  Username: alex_rivera');
  } catch (err) {
    console.error('[Seed Error]:', err);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

if (require.main === module) {
  seedDemoData();
}

module.exports = { populateDemoData, seedDemoData };
