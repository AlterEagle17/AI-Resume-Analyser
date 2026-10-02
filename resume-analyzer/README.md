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

## Production build

```powershell
npm run build --prefix client
```
