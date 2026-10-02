# Resume Analyzer

A React and Express application for analyzing a resume against a target role.

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

Server-only configuration belongs in `server/.env`. It is ignored by Git. Copy `server/.env.example` to `server/.env` when setting up a fresh checkout. Never place API keys in client or `VITE_` environment variables.

## Production build

```powershell
npm run build --prefix client
```
