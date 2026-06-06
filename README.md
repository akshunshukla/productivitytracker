<![CDATA[<div align="center">

# FocusFlow 🎯

**A full-stack productivity tracker with session timing, goal management, visual analytics, and AI-powered insights.**

Built with React · Node.js · MongoDB · Google Gemini

[![Node.js](https://img.shields.io/badge/Node.js-≥18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [Sessions](#sessions)
  - [Goals](#goals)
  - [Tasks](#tasks)
  - [Analytics & Reports](#analytics--reports)
  - [AI & Quotes](#ai--quotes)
- [Data Models](#data-models)
- [Key Concepts](#key-concepts)
  - [Session Timing Model](#session-timing-model)
  - [Goal Auto-Tracking](#goal-auto-tracking)
  - [Streak Tracking](#streak-tracking)
  - [AI Insights Pipeline](#ai-insights-pipeline)
  - [Rate Limiting](#rate-limiting)
  - [Token Refresh Flow](#token-refresh-flow)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

FocusFlow is a full-stack web application designed to help users build better work habits. It combines a precision session timer with intelligent goal tracking, comprehensive analytics, and AI-generated productivity insights powered by Google Gemini. Users can track their focus sessions with tags, set time-based goals, monitor daily streaks, and receive personalized recommendations based on their work patterns.

---

## Features

### Core

| Feature | Description |
|---|---|
| **Session Timer** | Start, pause, resume, and end timed focus sessions with interval-based timing that stays accurate across tab switches and browser sleep |
| **Tag-based Tracking** | Tag every session (e.g., `coding`, `reading`, `design`). Sessions automatically contribute to matching goals |
| **Goal Management** | Set goals with a target duration and optional deadline. Progress updates automatically as sessions are completed |
| **Daily Todo List** | Lightweight daily checklist scoped to today |
| **Session History** | Browse, filter, and edit past sessions with pagination, tag/date/rating filters |
| **Streak Tracking** | Automatic daily streak tracking with current and longest streak stats |

### Analytics & AI

| Feature | Description |
|---|---|
| **Analytics Dashboard** | Weekly summary bar chart, tag-wise donut chart, daily breakdown, and today's summary |
| **AI Insights** | On-demand Gemini-powered analysis covering time distribution, productivity patterns, focus quality, goal progress, and actionable recommendations |
| **Insights History** | Browse past AI-generated reports with timestamped history |
| **Motivational Quotes** | AI-generated motivational quotes on every dashboard load, with fallback quotes when the AI service is unavailable |

### Security & Reliability

| Feature | Description |
|---|---|
| **JWT Authentication** | Access + refresh token rotation stored in `httpOnly` cookies |
| **Auto Token Refresh** | Axios interceptor automatically refreshes expired tokens and retries failed requests |
| **Rate Limiting** | Auth endpoints (5 req/15min) and AI analysis (5 req/24h) are rate-limited |
| **Goal Rollback** | Deleting a session automatically rolls back its duration from the linked goal |
| **Global Timer** | Persistent floating timer widget visible across all pages during active sessions |
| **Browser Notifications** | Optional notification permission request for session reminders |

---

## Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org/) | JavaScript runtime |
| [Express 5](https://expressjs.com/) | Web framework |
| [MongoDB](https://www.mongodb.com/) + [Mongoose 8](https://mongoosejs.com/) | Database + ODM |
| [JWT](https://jwt.io/) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Authentication & password hashing |
| [Google Gemini API](https://ai.google.dev/) | AI-powered analytics & quote generation |
| [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) | Rate limiting middleware |

### Frontend

| Technology | Purpose |
|---|---|
| [React 19](https://react.dev/) | UI framework |
| [Vite 7](https://vite.dev/) | Build tool & dev server |
| [React Router v7](https://reactrouter.com/) | Client-side routing |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first CSS |
| [shadcn/ui](https://ui.shadcn.com/) (Radix UI) | Accessible component library |
| [Recharts](https://recharts.org/) | Data visualization |
| [Axios](https://axios-http.com/) | HTTP client with interceptors |
| [Sonner](https://sonner.emilkowal.dev/) | Toast notifications |
| [Lucide React](https://lucide.dev/) | Icon library |
| [date-fns](https://date-fns.org/) | Date formatting |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (React + Vite)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐   │
│  │  Pages   │  │Components│  │ Context  │  │  Axios + Auth │   │
│  │Dashboard │  │SessionTmr│  │AuthCtx   │  │  Interceptor  │   │
│  │Analytics │  │GlobalTmr │  │SessionCtx│  │  (auto token  │   │
│  │Goals     │  │Sidebar   │  │          │  │   refresh)    │   │
│  │Insights  │  │GoalCard  │  │          │  │               │   │
│  │History   │  │TodoList  │  │          │  │               │   │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API (JSON)
                             │ httpOnly Cookies (JWT)
┌────────────────────────────┴────────────────────────────────────┐
│                     Server (Express 5)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐   │
│  │  Routes  │  │Controllers│ │Middleware│  │   Services    │   │
│  │  /user   │  │user      │  │verifyJWT │  │ analytics.svc │   │
│  │  /session│  │session   │  │rateLimit │  │  (Gemini AI)  │   │
│  │  /goal   │  │goal      │  │          │  │               │   │
│  │  /task   │  │task      │  │          │  │               │   │
│  │/analytics│  │report    │  │          │  │               │   │
│  │  /quote  │  │quote     │  │          │  │               │   │
│  └──────────┘  └──────────┘  └──────────┘  └───────┬───────┘   │
└────────────────────────────┬───────────────────────┼───────────┘
                             │                       │
                    ┌────────┴────────┐    ┌─────────┴────────┐
                    │    MongoDB      │    │  Google Gemini   │
                    │  (Atlas/Local)  │    │   2.5 Flash      │
                    └─────────────────┘    └──────────────────┘
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** — [Atlas (cloud)](https://www.mongodb.com/atlas) or local instance
- **Google Gemini API Key** — [Get one here](https://aistudio.google.com/app/apikey)

### Installation

```bash
# Clone the repository
git clone https://github.com/akshunshukla/productivitytracker.git
cd productivitytracker

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Server
PORT=8000

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>

# JWT
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

# CORS
CORS_ORIGIN=http://localhost:5173

# AI
GEMINI_API_KEY=your_gemini_api_key
```

> **Note:** Generate strong random secrets for `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET`. You can use `openssl rand -base64 64` to generate them.

### Running Locally

Start both the backend and frontend dev servers:

```bash
# Terminal 1 — Backend (port 8000)
cd server
npm run dev

# Terminal 2 — Frontend (port 5173)
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Structure

```
productivitytracker/
├── client/                          # React frontend (Vite)
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js             # Axios instance with token refresh interceptor
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn/ui primitives (Button, Card, Dialog, etc.)
│   │   │   ├── ActiveGoals.jsx       # Dashboard active goals widget
│   │   │   ├── AuthLayout.jsx        # Auth pages layout wrapper
│   │   │   ├── CreateGoalDialog.jsx  # Goal creation modal
│   │   │   ├── DashboardLayout.jsx   # Dashboard layout with sidebar
│   │   │   ├── EditGoalDialog.jsx    # Goal editing modal
│   │   │   ├── GlobalTimer.jsx       # Persistent floating timer widget
│   │   │   ├── GoalCard.jsx          # Individual goal progress card
│   │   │   ├── MotivationalQuote.jsx # AI-generated quote display
│   │   │   ├── RecentSessions.jsx    # Last 5 sessions list
│   │   │   ├── SessionTimer.jsx      # Main session timer with controls
│   │   │   ├── Sidebar.jsx           # Navigation sidebar
│   │   │   ├── StartSessionDialog.jsx# Session start modal with tag input
│   │   │   └── TodoList.jsx          # Daily checklist
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Auth state (user, login, logout)
│   │   │   └── SessionContext.jsx    # Active session state + notification permission
│   │   ├── hooks/
│   │   │   └── useAuth.js           # Auth context consumer hook
│   │   ├── pages/
│   │   │   ├── Analytics.jsx         # Charts & data visualization
│   │   │   ├── Dashboard.jsx         # Main dashboard with widgets
│   │   │   ├── Goals.jsx             # Goal management CRUD
│   │   │   ├── Insights.jsx          # AI insights display + history
│   │   │   ├── Login.jsx             # Login form
│   │   │   ├── SessionHistory.jsx    # Filterable session history table
│   │   │   └── Signup.jsx            # Registration form
│   │   ├── App.jsx                   # Route definitions
│   │   ├── App.css                   # Global styles + Tailwind config
│   │   ├── ProtectedRoute.jsx        # Auth route guard
│   │   └── main.jsx                  # App entry point with providers
│   ├── vercel.json                   # Vercel SPA rewrite config
│   └── package.json
│
├── server/                           # Express backend
│   ├── src/
│   │   ├── config/                   # Configuration files
│   │   ├── controllers/
│   │   │   ├── goal.controller.js    # Goal CRUD
│   │   │   ├── quote.controller.js   # Gemini quote generation + fallback
│   │   │   ├── report.controller.js  # Analytics queries + insights history
│   │   │   ├── session.controller.js # Session CRUD, streak, goal rollback
│   │   │   ├── task.controller.js    # Daily task CRUD
│   │   │   └── user.controller.js    # Auth (register, login, logout, refresh)
│   │   ├── db/                       # MongoDB connection
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js     # JWT verification guard
│   │   │   └── rateLimiter.js        # Rate limiting (auth + AI)
│   │   ├── models/
│   │   │   ├── goal.model.js         # Goal schema
│   │   │   ├── insight.model.js      # AI insight history schema
│   │   │   ├── session.model.js      # Session schema with intervals
│   │   │   ├── task.model.js         # Daily task schema
│   │   │   └── user.model.js         # User schema with streaks + AI data
│   │   ├── routes/
│   │   │   ├── analytics.route.js    # Analytics & AI analysis routes
│   │   │   ├── goal.route.js         # Goal CRUD routes
│   │   │   ├── quote.route.js        # Quote generation route
│   │   │   ├── sessions.route.js     # Session management routes
│   │   │   ├── task.route.js         # Task CRUD routes
│   │   │   └── user.route.js         # Auth routes
│   │   ├── services/
│   │   │   └── analytics.service.js  # Gemini AI analytics pipeline
│   │   ├── utils/
│   │   │   ├── ApiError.js           # Custom error class
│   │   │   ├── ApiResponse.js        # Standardized response wrapper
│   │   │   └── asyncHandler.js       # Async error handler
│   │   ├── app.js                    # Express app setup (CORS, routes, middleware)
│   │   └── index.js                  # Server entry point
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## API Reference

All routes are prefixed with `/api/v1`. Protected routes require a valid JWT (sent via `httpOnly` cookie).

### Authentication

| Method | Endpoint | Auth | Rate Limited | Description |
|---|---|---|---|---|
| `POST` | `/user/register` | ❌ | ✅ 5/15min | Register a new user |
| `POST` | `/user/login` | ❌ | ✅ 5/15min | Login and receive tokens |
| `POST` | `/user/logout` | ✅ | ❌ | Logout and clear tokens |
| `POST` | `/user/refreshAccessToken` | ❌ | ❌ | Refresh the access token |
| `GET` | `/user/userProfile` | ✅ | ❌ | Get current user profile |

### Sessions

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/session/startSession` | ✅ | Start a new session with a tag |
| `PATCH` | `/session/pauseSession/:sessionId` | ✅ | Pause an active session |
| `PATCH` | `/session/resumeSession/:sessionId` | ✅ | Resume a paused session |
| `POST` | `/session/end/:sessionId` | ✅ | End a session (requires rating 1–5) |
| `DELETE` | `/session/delete/:sessionId` | ✅ | Delete a session (rolls back goal progress) |
| `GET` | `/session/current` | ✅ | Get the current active/paused session |
| `GET` | `/session/history` | ✅ | Get past sessions (filterable, paginated) |
| `PATCH` | `/session/update/:sessionId` | ✅ | Update session rating/notes |

**Session History Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `tag` | `string` | Filter by tag name |
| `startDate` | `ISO string` | Filter start date |
| `endDate` | `ISO string` | Filter end date |
| `rating` | `number` | Filter by rating (1–5) |
| `page` | `number` | Page number (default: 1) |
| `limit` | `number` | Results per page (default: 10) |

### Goals

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/goal` | ✅ | Create a new goal |
| `GET` | `/goal` | ✅ | Get all user goals |
| `PATCH` | `/goal/:goalId` | ✅ | Update a goal |
| `DELETE` | `/goal/:goalId` | ✅ | Delete a goal |

### Tasks

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/task` | ✅ | Create a new task |
| `GET` | `/task/today` | ✅ | Get today's tasks |
| `PATCH` | `/task/:taskId` | ✅ | Update a task (toggle completion) |
| `DELETE` | `/task/:taskId` | ✅ | Delete a task |

### Analytics & Reports

| Method | Endpoint | Auth | Rate Limited | Description |
|---|---|---|---|---|
| `POST` | `/analytics/run-analysis` | ✅ | ✅ 5/24h | Trigger AI analysis |
| `GET` | `/analytics/weeklySummary` | ✅ | ❌ | Weekly hours summary |
| `GET` | `/analytics/dailyBreakdown` | ✅ | ❌ | Daily breakdown data |
| `GET` | `/analytics/tagWiseStats` | ✅ | ❌ | Tag-wise time distribution |
| `GET` | `/analytics/tags` | ✅ | ❌ | List of user tags |
| `GET` | `/analytics/last-five` | ✅ | ❌ | Last 5 completed sessions |
| `GET` | `/analytics/todays-summary` | ✅ | ❌ | Today's total stats |
| `GET` | `/analytics/history` | ✅ | ❌ | Past AI insight reports |

### AI & Quotes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/quote/generate` | ✅ | Generate an AI motivational quote (with fallback) |

---

## Data Models

### User

| Field | Type | Description |
|---|---|---|
| `username` | String | Unique, lowercase username |
| `fullname` | String | Display name |
| `email` | String | Unique email (validated) |
| `password` | String | bcrypt hashed password |
| `refreshToken` | String | Current refresh token |
| `timezone` | String | User timezone (default: UTC) |
| `currentStreak` | Number | Current consecutive-day streak |
| `longestStreak` | Number | All-time longest streak |
| `lastActiveDate` | String | Last active date (`YYYY-MM-DD`) |
| `aiInsights` | Object | Latest AI analysis report |

### Session

| Field | Type | Description |
|---|---|---|
| `userId` | ObjectId | Reference to User |
| `goalId` | ObjectId | Reference to linked Goal (nullable) |
| `intervals` | Array | `[{ startTime, endTime }]` — pause/resume intervals |
| `duration` | Number | Total duration in milliseconds |
| `tags` | [String] | Session tags |
| `status` | Enum | `active` · `paused` · `completed` |
| `date` | String | Session date (`YYYY-MM-DD`) |
| `rating` | Number | Focus quality rating (1–5) |
| `notes` | String | Optional session notes |

### Goal

| Field | Type | Description |
|---|---|---|
| `userId` | ObjectId | Reference to User |
| `title` | String | Goal title |
| `description` | String | Optional description |
| `tag` | String | Linked tag (lowercase) |
| `targetDuration` | Number | Target time in milliseconds |
| `loggedDuration` | Number | Time logged from sessions |
| `deadline` | Date | Optional deadline |
| `status` | Enum | `not-started` · `in-progress` · `completed` |

### Insight

| Field | Type | Description |
|---|---|---|
| `userId` | ObjectId | Reference to User |
| `reportData` | Object | Snapshot of AI analysis report |
| `createdAt` | Date | Timestamp of analysis |

---

## Key Concepts

### Session Timing Model

FocusFlow uses an **interval-based timing model** for accuracy:

```
Session Start → Interval 1 { startTime }
   ↓ Pause   → Interval 1 { startTime, endTime } → duration += delta
   ↓ Resume  → Interval 2 { startTime }
   ↓ End     → Interval 2 { startTime, endTime } → duration += delta
                Total duration = sum of all interval deltas
```

- **Pause** closes the current interval and accumulates its duration.
- **Resume** opens a new interval.
- **End** closes the final interval and writes the total.
- The frontend recalculates elapsed time from server timestamps, handling tab switches and laptop sleep correctly.

### Goal Auto-Tracking

1. Create a goal with a **tag** (e.g., `coding`) and a **target duration** (e.g., 20 hours).
2. Starting a session tagged `coding` automatically links it to the matching goal.
3. When the session ends, the goal's `loggedDuration` increases by the session duration.
4. When `loggedDuration ≥ targetDuration`, the goal status changes to `completed`.
5. Deleting a session **rolls back** its duration from the linked goal, re-opening it if necessary.

### Streak Tracking

- When a session ends, the system checks if the user was active today.
- If not, it compares today with `lastActiveDate`:
  - **1 day difference** → `currentStreak += 1`
  - **>1 day difference** → `currentStreak = 1` (reset)
- `longestStreak` is updated whenever `currentStreak` exceeds it.

### AI Insights Pipeline

When you click **"Generate Analysis"** on the Insights page:

1. **Data Aggregation** — The backend runs 5 analysis functions:
   - Day-of-week performance (avg rating + hours per weekday)
   - Duration vs. focus quality (short/medium/long session buckets)
   - Tag-by-tag performance metrics
   - Peak productivity time block (morning/afternoon/evening/night)
   - Goal completion progress summary

2. **Prompt Engineering** — All data is formatted into a structured prompt and sent to **Google Gemini 2.5 Flash**.

3. **AI Response** — Gemini returns a structured JSON report with 5 sections:
   - Time Distribution
   - Productivity Patterns
   - Focus Quality
   - Goal Progress
   - Personalized Recommendations (high/medium/low priority)

4. **Storage** — The report is saved to:
   - The user profile (`aiInsights` field) for instant display
   - The `Insight` collection for historical access

### Rate Limiting

| Limiter | Scope | Limit | Window |
|---|---|---|---|
| `authLimiter` | `/user/register`, `/user/login` | 5 requests | 15 minutes |
| `aiLimiter` | `/analytics/run-analysis` | 5 requests | 24 hours |

### Token Refresh Flow

```
Client Request → 401 Unauthorized
    ↓
Axios Interceptor catches error
    ↓
POST /user/refreshAccessToken (with refresh token cookie)
    ↓
New access token set in cookie → Retry original request
    ↓
If refresh fails → Redirect to /login
```

The interceptor prevents infinite loops by skipping retry on the refresh endpoint itself and tracking `_retry` flags.

---

## Deployment

### Frontend → Vercel

1. Import the `client/` directory on [Vercel](https://vercel.com/).
2. The included `vercel.json` handles SPA routing rewrites.
3. Set the production API URL in `src/api/axios.js` or via environment variables.

### Backend → Render / Railway / Any Node.js Host

1. Set all `.env` variables in your hosting platform's environment settings.
2. Update `CORS_ORIGIN` to your deployed frontend URL.
3. The entry point is `src/index.js` with the start command:
   ```bash
   node -r dotenv/config --experimental-json-modules src/index.js
   ```

> **Tip:** The Express server includes a catch-all route that serves `client/dist/index.html`, so you can serve everything from a single host if preferred.

---

## Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes with descriptive messages
4. Push to your branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please ensure your code follows the existing project conventions and all features work correctly before submitting.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ by [Akshun Shukla](https://github.com/akshunshukla)**

</div>
]]>
