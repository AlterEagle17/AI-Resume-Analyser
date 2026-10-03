# Resume Analyzer

A React and Express application for analyzing a resume against a target job role entered by the user.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Setup

Open two terminals in the `resume-analyzer` directory.

In the first terminal, install and start the API server:

```powershell
npm install --prefix server
npm run dev --prefix server
```

In the second terminal, install and start the React client:

```powershell
npm install --prefix client
npm run dev --prefix client
```

Open the local URL printed by Vite. The client proxies `/api` requests to the Express server at `http://localhost:3000`.

Check the server health endpoint at `http://localhost:3000/api/health`; it should return `{"status":"ok"}`.

## Environment

Server-only configuration belongs in `server/.env`. It is ignored by Git. Copy `server/.env.example` to `server/.env` when setting up a fresh checkout, then set `GROQ_API_KEY` in that server file. The default model is `openai/gpt-oss-20b`; set `GROQ_MODEL` in `server/.env` to select another model available to your Groq account. Never place API keys in client or `VITE_` environment variables.

The Express server extracts resume text and sends it to Groq for structured analysis. Enter any target job title, such as Frontend Developer, Java Developer, or DevOps Engineer; the server trims it and limits it to 100 characters. Known roles may receive optional skill guidance, while custom roles are analyzed directly from the entered title. Both the role and resume are treated as untrusted data by the analysis prompt. The original PDF is held in memory for the request and is not stored.

### Daily AI budget

`DAILY_AI_BUDGET_INR` sets the maximum estimated Groq spend per India calendar day. If it is blank or invalid, the server uses a default of ₹100. Model token prices and the USD-to-INR conversion are centralized in `server/lib/costs.js`; update them there when provider pricing or the exchange reference changes. Cost estimates use input/output tokens and a bounded 512-token completion. Before each Groq attempt, the server reserves a conservative estimate; if it does not fit the remaining budget, it skips Groq and returns the P08 skill-match fallback. The in-memory tracker resets at midnight in `Asia/Kolkata` (IST). Spending is not persisted and resets on server restart; separate server instances do not share a budget counter.

## MongoDB Atlas and analysis history

Create a MongoDB Atlas database named `resume_analyzer`, then configure its connection string in `server/.env` as `MONGODB_URI`. Keep credentials only in that ignored server file; the committed `server/.env.example` contains a blank URI placeholder. The server connects to Atlas at startup. If MongoDB is unavailable, analysis can still complete, but history is unavailable and persistence failures are logged without returning connection details.

The `users` collection stores only an anonymous UUID `userId`, `createdAt`, and `lastActiveAt`. The browser creates this UUID once with `crypto.randomUUID()`, stores it as `resume_analyzer_user_id` in localStorage, and reuses it for future analyses. There is no login or authentication in this phase.

The `analyses` collection stores `userId`, target role, score (null for fallback), verdict, skills found/missing, suggestions, fallback status, input/output tokens, P09 `costInr`, and creation time. It has a `{ userId, createdAt }` index. The PDF and extracted resume text are never stored.

`GET /api/history/:userId` returns the anonymous user's metadata and at most their latest 10 analyses, newest first. A first-time UUID receives an empty analyses list until its first request to `POST /api/analyze` creates the user.

## Production build

```powershell
npm run build --prefix client
```
