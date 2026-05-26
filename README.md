# FocusFlow 🎯

> A full-stack productivity tracker with session timing, goal management, visual analytics, and AI-powered insights — built with React, Node.js, MongoDB, and Google Gemini.

---

## ✨ Features

- **⏱ Session Timer** — Start, pause, resume, and end timed focus sessions. The timer is accurate across tab switches and browser sleep.
- **🏷 Tag-based Tracking** — Tag every session (e.g., `coding`, `design`, `reading`). Sessions with the same tag automatically contribute to matching goals.
- **🎯 Goal Tracking** — Set goals with a target duration and deadline. Progress updates automatically as you complete sessions.
- **✅ Daily Todo List** — A lightweight checklist scoped to today.
- **📊 Analytics Dashboard** — Visualize your week with a daily hours bar chart and an all-time tag distribution donut chart.
- **🤖 AI Insights** — On demand, the backend analyzes your session history and sends it to Google Gemini, which returns a personalized report covering time distribution, productivity patterns, focus quality, goal progress, and actionable recommendations.
- **💬 AI Motivational Quotes** — Every dashboard load fetches a fresh Gemini-generated motivational quote.
- **🔐 Secure Auth** — JWT-based authentication with access + refresh token rotation, stored in `httpOnly` cookies.

---

## 🛠 Tech Stack

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose
- JWT authentication + bcryptjs
- Google Gemini API (`@google/generative-ai`)

**Frontend**
- React 19 + Vite 7
- React Router DOM v7
- shadcn/ui (Radix UI + Tailwind CSS v4)
- Recharts (data visualization)
- Axios + Sonner

---

## 📁 Project Structure

```
tracker/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── pages/   # Dashboard, Analytics, Goals, Insights, Login, Signup
│       ├── components/
│       ├── context/ # AuthContext, SessionContext
│       └── api/     # Axios instance
└── server/          # Express backend
    └── src/
        ├── models/       # User, Session, Goal, Task
        ├── controllers/  # Business logic
        ├── services/     # Gemini AI analytics pipeline
        ├── routes/
        └── middlewares/  # JWT auth guard
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB (Atlas or local)
- A Google Gemini API key ([get one here](https://aistudio.google.com/app/apikey))

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/focusflow.git
cd focusflow
```

### 2. Set up the backend
```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:
```env
PORT=8000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net
ACCESS_TOKEN_SECRET=your_access_secret_here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_secret_here
REFRESH_TOKEN_EXPIRY=10d
CORS_ORIGIN=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the development server:
```bash
npm run dev
```

### 3. Set up the frontend
```bash
cd ../client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔌 API Overview

All API routes are prefixed with `/api/v1`.

| Resource | Routes |
|---|---|
| Auth | `POST /user/register`, `POST /user/login`, `POST /user/logout`, `POST /user/refreshToken`, `GET /user/userProfile` |
| Sessions | `POST /session/startSession`, `PATCH /session/pauseSession/:id`, `PATCH /session/resumeSession/:id`, `POST /session/end/:id`, `DELETE /session/delete/:id`, `GET /session/current` |
| Goals | `POST /goal`, `GET /goal`, `PATCH /goal/:id`, `DELETE /goal/:id` |
| Tasks | `POST /task`, `GET /task`, `PATCH /task/:id`, `DELETE /task/:id` |
| Analytics | `GET /analytics/weeklySummary`, `GET /analytics/dailyBreakdown`, `GET /analytics/tagWiseStats`, `GET /analytics/todays-summary`, `GET /analytics/last-five` |
| AI | `POST /analytics/run-analysis`, `GET /quote` |

---

## 🤖 How AI Insights Work

When you click **"Generate Analysis"** on the Insights page:

1. The backend aggregates your session history into structured data:
   - Day-of-week performance (avg rating + hours per day)
   - Session duration vs. focus quality (short/medium/long buckets)
   - Tag-by-tag performance metrics
   - Peak productivity time (morning / afternoon / evening / night)
   - Goal completion progress

2. All of this is formatted into a detailed prompt and sent to **Google Gemini 2.5 Flash**.

3. Gemini returns a structured JSON report with 5 sections: Time Distribution, Productivity Patterns, Focus Quality, Goal Progress, and personalized Recommendations.

4. The report is saved to your user profile and displayed instantly on the Insights page.

---

## 🧠 How Session Timing Works

FocusFlow uses an **interval-based timing model** for accuracy:

- Each session stores an array of `{ startTime, endTime }` intervals.
- **Pause** → closes the current interval and adds its duration to a running total.
- **Resume** → opens a new interval.
- **End** → closes the final interval and writes the total duration.
- The frontend timer calculates elapsed time client-side from server timestamps, recalibrating whenever the tab regains focus (handles laptop sleep and tab switching correctly).

---

## 🎯 How Goal Auto-Tracking Works

1. Create a goal with a **tag** (e.g., `coding`) and a **target duration** (e.g., 20 hours).
2. Whenever you start a session tagged `coding`, FocusFlow automatically links it to your goal.
3. When the session ends, the goal's **logged duration** increases automatically.
4. When logged ≥ target, the goal is marked **Completed** — no manual tracking needed.

---

## 🚢 Deployment

**Frontend → Vercel**
- The `client/vercel.json` rewrites all paths to `index.html` for SPA routing.
- Set `VITE_API_URL` (or configure in `src/api/axios.js`) to your backend URL.

**Backend → Render / Railway / any Node host**
- Set all `.env` variables in your host's environment settings.
- Update `CORS_ORIGIN` to your Vercel frontend URL.
- The Express server also serves the React build as static files, so you can serve everything from one host if preferred.

---

## 📄 License

MIT
