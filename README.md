# DevTrack — Developer Progress Hub

DevTrack is a production-quality full-stack MERN application that empowers software developers to manage their coding journey in one unified, elegant workspace. It tracks development projects, learning goals, live GitHub activity, user-reported LeetCode progress, and publishes public developer portfolios without compromising privacy.

Designed with a sleek, distraction-free black-and-white developer aesthetic inspired by modern engineering tools:
- **Background:** `#0B0B0C`
- **Surface Cards:** `#151517`
- **Borders:** Subtle gray `#222226`
- **Typography:** Inter & JetBrains Mono

---

## Table of Contents

1. [Architecture & Technology Stack](#1-architecture--technology-stack)
2. [Project Structure](#2-project-structure)
3. [Environment Configuration](#3-environment-configuration)
4. [Installation & Local Setup](#4-installation--local-setup)
5. [Running the Application](#5-running-the-application)
6. [API Endpoints Documentation](#6-api-endpoints-documentation)
7. [Core Features & Working Flows](#7-core-features--working-flows)
8. [Security & Privacy Guarantees](#8-security--privacy-guarantees)
9. [Automated Testing & Verification](#9-automated-testing--verification)
10. [Production Deployment Guide (Vercel + Render + MongoDB Atlas)](#10-production-deployment-guide)
11. [Troubleshooting Guide](#11-troubleshooting-guide)

---

## 1. Architecture & Technology Stack

### Frontend
- **Framework:** React with Vite
- **Styling:** Tailwind CSS (Custom dark theme palette `#0B0B0C` / `#151517`)
- **Routing:** React Router v7 with protected route guards and Vercel SPA rewrites
- **HTTP Client:** Axios (configured with `withCredentials: true` and URL normalization)
- **Analytics & Visualizations:** Recharts (Weekly focus bar charts) & Interactive GitHub-style SVG Contribution Heatmap
- **Optimization:** Rollup vendor code-splitting (`vendor-react`, `vendor-charts`, `vendor-ui`, `vendor-libs`)
- **Icons:** Lucide React & Custom Developer SVGs

### Backend
- **Runtime:** Node.js (v24+)
- **Server Framework:** Express.js (`trust proxy` enabled for cloud load balancers)
- **Database & ODM:** MongoDB Atlas / Local MongoDB with Mongoose (plus automated in-memory fallback for instant zero-config testing)
- **Authentication:** JSON Web Tokens (JWT) stored in HTTP-only, secure, `SameSite=None` (production) / `Lax` (dev) cookies
- **Password Security:** bcryptjs (10 salt rounds with pre-save hashing hooks)
- **Validation:** express-validator for strict schema sanitization and field verification
- **Security Middleware:** Helmet, dynamic CORS with strict credentials, express-rate-limit

---

## 2. Project Structure

```
Developer Progress Hub/
├── package.json                   # Root orchestrator scripts
├── vercel.json                    # Root Vercel SPA fallback configuration
├── .gitignore                     # Git ignore rules for node_modules, .env, and dist
├── README.md                      # Comprehensive documentation
│
├── server/                        # Express API Backend
│   ├── .env                       # Local environment variables (excluded from git)
│   ├── .env.example               # Environment variables template
│   ├── package.json               # Backend dependencies & test scripts
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # MongoDB Atlas connection & MongoMemoryServer fallback
│   │   ├── models/
│   │   │   ├── User.js            # User schema, password hashing & profile settings
│   │   │   ├── Project.js         # Projects schema with technologies, completion & ownership
│   │   │   ├── Goal.js            # Learning goals schema with target types & progress auto-completion
│   │   │   └── ActivityLog.js     # Daily coding sessions and problem practice log
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verification from HTTP-only cookies
│   │   │   ├── validation.js      # Express-validator rules for all endpoints
│   │   │   ├── rateLimiter.js     # API & authentication brute-force rate limiters
│   │   │   └── errorHandler.js    # Centralized error handler and 404 middleware
│   │   ├── controllers/
│   │   │   ├── authController.js        # Register, login, logout, me
│   │   │   ├── projectController.js     # Project CRUD with strict user ownership
│   │   │   ├── goalController.js        # Goal CRUD with progress update
│   │   │   ├── activityController.js    # Activity logs & authentic streak calculation
│   │   │   ├── dashboardController.js   # Aggregated metrics, charts & heatmap data
│   │   │   ├── userController.js        # Public profiles, settings & LeetCode updates
│   │   │   └── integrationController.js # Live GitHub REST API proxy & rate limits
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── projectRoutes.js
│   │   │   ├── goalRoutes.js
│   │   │   ├── activityRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   └── integrationRoutes.js
│   │   ├── app.js                 # Express application configuration
│   │   ├── server.js              # Server entry point with graceful shutdown
│   │   └── seed.js                # Database demo seeder
│   └── tests/
│       ├── api.test.js            # Automated Jest & Supertest suite (11 unit/integration tests)
│       └── verifyAllFlows.js      # End-to-end integration flow runner
│
└── client/                        # React + Vite Frontend
    ├── vercel.json                # Vercel SPA client rewrite configuration
    ├── .env.example               # Frontend environment template
    ├── index.html                 # App shell with Inter & JetBrains Mono fonts
    ├── tailwind.config.js         # DevTrack dark color tokens & utilities
    ├── vite.config.js             # Vite config with Rollup code-splitting chunks
    ├── package.json               # Frontend dependencies & Vite scripts
    └── src/
        ├── api/                   # Axios client (normalized URL) & API service modules
        ├── context/               # AuthContext & ToastContext
        ├── components/
        │   ├── common/            # Sidebar, Navbar, Modal, ConfirmDialog, Badge, Heatmap, Icons
        │   ├── projects/          # ProjectCard, ProjectModal
        │   └── goals/             # GoalCard, GoalModal, ActivityLogModal
        ├── pages/                 # Overview, Projects, Goals, GitHub, LeetCode, PublicProfile, Settings
        └── layouts/               # DashboardLayout with collapsible responsive sidebar
```

---

## 3. Environment Configuration

### Backend (`server/.env`)
Template provided in `server/.env.example`:

```env
PORT=5000
NODE_ENV=development

# MongoDB Connection String (Atlas or local mongod)
# DevTrack automatically falls back to an in-memory Mongo database if no local MongoDB service is running
MONGODB_URI=mongodb://127.0.0.1:27017/devtrack

# JWT Secret (Use a strong random 32+ character key in production)
JWT_SECRET=devtrack_super_secure_jwt_secret_dev_key_2026_xyz
JWT_EXPIRES_IN=7d

# Allowed Frontend Origins for CORS & Cookies (comma-separated for multiple domains)
CLIENT_URL=http://localhost:5173

# Optional: GitHub Personal Access Token (lifts public 60 req/hr rate limit)
GITHUB_TOKEN=
```

### Frontend (`client/.env`)
Template provided in `client/.env.example`:

```env
# Base URL for the backend API (normalize handles trailing slashes or missing /api automatically)
# In local development: http://localhost:5000/api
# In production on Vercel: https://your-backend-app.onrender.com/api
VITE_API_URL=http://localhost:5000/api
```

---

## 4. Installation & Local Setup

### Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v9+

### 1. Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. (Optional) Seed Demo Data
To populate sample projects, learning goals, LeetCode metrics, and 7 consecutive days of authentic activity:
```bash
cd server
npm run seed
```

**Demo Credentials:**
- **Email:** `demo@devtrack.io`
- **Password:** `password123`
- **Username:** `alex_rivera`

---

## 5. Running the Application

### Option A: Run Both Together from Root
```bash
# Terminal 1: Start Backend Server (runs on http://localhost:5000)
npm run server

# Terminal 2: Start Frontend Client (runs on http://localhost:5173)
npm run client
```

### Option B: Run Individually
```bash
# In server directory:
cd server
npm start

# In client directory:
cd client
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 6. API Endpoints Documentation

All routes except `/api/auth/register`, `/api/auth/login`, `/api/users/:username/public`, `/health`, and `/api/health` require authentication.

### Health Checks
| Method | Route | Description | Auth Required |
|---|---|---|---|
| `GET` | `/health` | Standard cloud load balancer health check with DB status | No |
| `GET` | `/api/health` | API health check reporting environment and DB state | No |

### Authentication
| Method | Route | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user, set HTTP-only cookie | No |
| `POST` | `/api/auth/login` | Login user, verify password, set cookie | No |
| `POST` | `/api/auth/logout` | Clear auth cookie | No |
| `GET` | `/api/auth/me` | Fetch authenticated user identity | Yes |

### Projects (Strict Ownership Enforced)
| Method | Route | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/projects` | Query user projects (search, filter, sort) | Yes |
| `POST` | `/api/projects` | Create project bound to `req.user._id` | Yes |
| `GET` | `/api/projects/:id` | Get single project by ID (owner check) | Yes |
| `PATCH` | `/api/projects/:id` | Update project (owner check) | Yes |
| `DELETE` | `/api/projects/:id` | Delete project (owner check) | Yes |

### Goals & Habits
| Method | Route | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/goals` | Get user's learning goals | Yes |
| `POST` | `/api/goals` | Create new learning goal | Yes |
| `PATCH` | `/api/goals/:id` | Update goal (current value, target, status) | Yes |
| `DELETE` | `/api/goals/:id` | Remove goal | Yes |

### Activity Logging & Consistency Streaks
| Method | Route | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/activity` | Get activity logs, authentic streaks & heatmap | Yes |
| `POST` | `/api/activity` | Record daily coding session or problem practice | Yes |

### Dashboard Overview
| Method | Route | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/dashboard` | Aggregated user metrics, 7-day chart & heatmap | Yes |

### Public Profiles & User Settings
| Method | Route | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/users/:username/public` | Public portfolio (**no email, no private projects**) | No |
| `PATCH` | `/api/users/profile` | Update profile, bio, skills, privacy settings | Yes |
| `PATCH` | `/api/users/leetcode` | Update user-reported LeetCode metrics | Yes |
| `PATCH` | `/api/users/password` | Change password with current password verification | Yes |

### Integrations
| Method | Route | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/integrations/github/:username` | Live public GitHub REST API proxy & rate limits | No (rate limited) |

---

## 7. Core Features & Working Flows

1. **Authentication Flow:** Registration with username, display name, email, and password. JWT is securely transmitted via `httpOnly`, `sameSite: 'none'` (prod) / `'lax'` (dev) cookie. Password hashes are never exposed.
2. **Project Portfolio CRUD:** Full management of projects with tag chips for technologies, GitHub repository links, live deployment links, status tracking (`Planned`, `In Progress`, `Completed`), and visual completion percentage. Completion to 100% automatically updates status.
3. **Goals & Learning Habits:** Define targets with units (hours, problems, commits, lessons) and frequencies (daily, weekly, milestones). Quick `+` and `-` buttons allow updating progress directly from the card.
4. **Authentic Streaks & Contribution Heatmap:** Streaks are calculated using real, dated activity logs stored in MongoDB. Active days, current streak, and longest streak reflect actual practice sessions.
5. **Live GitHub REST API Integration:** Fetches real developer profiles, avatar, public repos, followers, stargazers count, forks, and top programming languages with graceful rate-limit indicators.
6. **LeetCode Tracking:** User-reported problem counts (Easy, Medium, Hard, Total) validated for mathematical consistency, accompanied by personal problem practice logs.
7. **Public Developer Portfolio (`/u/:username`):** Shareable link showcasing public projects, bio, skills, and links without exposing emails or private projects.

---

## 8. Security & Privacy Guarantees

- **Ownership Enforcement:** Every project, goal, and activity record query strictly enforces `user: req.user._id` at the database level.
- **HTTP-Only Cookies:** Tokens are stored in HTTP-only cookies, safeguarding against Cross-Site Scripting (XSS).
- **Public Profile Privacy:** The public endpoint sanitizes user data: emails, hashed passwords, internal IDs, and private projects are strictly excluded.
- **Input Sanitization:** express-validator enforces length, email syntax, URL validity, and numeric ranges.
- **Brute-Force Protection:** express-rate-limit restricts authentication requests to 20 per 15-minute window.
- **Database Fallback:** Includes automatic failover to `mongodb-memory-server` in non-production environments to guarantee seamless local testing and evaluation.

---

## 9. Automated Testing & Verification

### Run Automated Backend Unit & Integration Tests
```bash
cd server
npm test
```

**Results:**
```
PASS tests/api.test.js
  DevTrack Backend API Tests
    Authentication Flows
      √ should register a new user, return user data without password, and set token cookie
      √ should reject registration if email is already registered
      √ should log in an existing user with correct credentials
      √ should fail login with wrong password
      √ should return current user via /api/auth/me when authenticated
      √ should reject /api/auth/me without token
    Project Management & Strict Ownership Enforcement
      √ should allow user to create, read, update, and delete their own project
      √ should prevent user 2 from modifying or deleting user 1 project
    Goals & Learning Tracker
      √ should create goal and auto-mark completed when target is met
    Public Developer Profile Privacy
      √ should return public profile without exposing email, password, or private projects
      √ should return 404 for non-existent profile

Test Suites: 1 passed, 1 total
Tests:       11 passed, 11 total
```

### Run End-to-End Multi-Step Verification Script
```bash
node server/tests/verifyAllFlows.js
```
*(Tests registration, login, project creation, status auto-change, goal completion, activity streaks, live GitHub API fetch, LeetCode updates, and public profile privacy against the live running server).*

---

## 10. Production Deployment Guide

### Step 1: MongoDB Atlas Setup
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Create a free **M0 Shared Cluster** (e.g. in AWS / us-east-1 or your preferred region).
3. Under **Database Access**:
   - Create a database user (e.g., `devtrack_user`).
   - Assign the **Read and write to any database** role.
   - Note the password (avoid unencoded special characters like `@`, `/`, or `:`).
4. Under **Network Access**:
   - Add IP Address `0.0.0.0/0` (Allow Access from Anywhere) so Render dynamic IP addresses can connect.
5. In your cluster dashboard, click **Connect** -> **Drivers** (Node.js) and copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/devtrack?retryWrites=true&w=majority
   ```

### Step 2: Render Backend Deployment
1. Log in to [Render](https://render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository containing the DevTrack project.
4. Configure the service settings:
   - **Name:** `devtrack-api` (or preferred name)
   - **Region:** Close to your MongoDB Atlas region (e.g., Oregon or Ohio)
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: *Your MongoDB Atlas connection URI from Step 1*
   - `JWT_SECRET`: *A secure random string (minimum 32 characters)*
   - `JWT_EXPIRES_IN`: `7d`
   - `CLIENT_URL`: `https://your-frontend-app.vercel.app` *(Can be updated after deploying Vercel)*
6. Under **Advanced**:
   - **Health Check Path:** `/health`
7. Click **Create Web Service**. Wait for the build to finish. Copy your Render backend URL (e.g., `https://devtrack-api.onrender.com`).

### Step 3: Vercel Frontend Deployment
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New...** -> **Project**.
3. Import your DevTrack GitHub repository.
4. In the Project Configuration:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click Edit and select `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://devtrack-api.onrender.com/api` *(Your Render backend URL with /api)*
6. Click **Deploy**. Vercel will build the frontend with vendor code splitting.
7. Once deployed, copy your Vercel URL (e.g., `https://devtrack-app.vercel.app`).

### Step 4: Final Domain Handshake
1. Return to your Render Web Service dashboard -> **Environment Variables**.
2. Update `CLIENT_URL` to match your actual Vercel URL:
   ```
   CLIENT_URL=https://devtrack-app.vercel.app
   ```
3. Render will automatically redeploy with the updated CORS allowlist.
4. Open your Vercel URL in your browser and test registration, login, and project creation.

---

## 11. Troubleshooting Guide

| Issue | Likely Cause | Solution |
|---|---|---|
| **CORS Error in Browser** | `CLIENT_URL` on Render doesn't match Vercel URL, or has an unhandled trailing slash | DevTrack's `app.js` automatically strips trailing slashes and permits `*.vercel.app` in production. Ensure `CLIENT_URL` in Render matches your Vercel domain. |
| **Cookies Not Persisting After Login** | Cross-domain cookie policy blocked by browser | DevTrack uses `SameSite=None; Secure=true` in production with `app.set('trust proxy', 1)`. Ensure both frontend and backend use HTTPS in production. |
| **404 On Page Refresh on Vercel** | SPA client-side routing missing fallback rewrite | DevTrack includes `client/vercel.json` and root `vercel.json` configuring `{ "source": "/(.*)", "destination": "/index.html" }`. |
| **MongoDB Connection Timeout on Render** | Atlas Network Access blocking Render's IP | In MongoDB Atlas, go to **Network Access** and ensure `0.0.0.0/0` is active. DevTrack has a 10s connection timeout for reliable cloud TLS handshakes. |
| **Render Free Tier Cold Start** | Render free tier spins down inactive services after 15 mins | Initial request after idle may take 30–50s to wake up the backend. Check `/health` endpoint to verify status. |
| **GitHub API Rate Limit (429)** | Exceeded 60 unauthenticated requests/hour | Add an optional `GITHUB_TOKEN` to your backend environment variables to raise the limit to 5,000 requests/hour. |