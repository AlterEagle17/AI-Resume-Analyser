import 'dotenv/config';
import express from 'express';
import analyzeRouter from './routes/analyze.js';
import historyRouter from './routes/history.js';
import { errorHandler } from './middleware/errors.js';
import { connectToDatabase } from './lib/db.js';
import { getConfiguredModel, getDailyBudgetInr } from './lib/costs.js';

const app = express();
const port = Number(process.env.PORT) || 3000;

console.info(`[DEBUG] GROQ_API_KEY configured: ${Boolean(process.env.GROQ_API_KEY?.trim())}`);
console.info(`[DEBUG] GROQ_MODEL: ${getConfiguredModel()}`);
console.info(`[DEBUG] DAILY_AI_BUDGET_INR: ${getDailyBudgetInr()}`);

app.get('/api/health', (_request, response) => {
  response.status(200).json({ status: 'ok' });
});

app.use('/api/analyze', analyzeRouter);
app.use('/api/history', historyRouter);
app.use(errorHandler);

connectToDatabase();

app.listen(port, () => {
  console.info(`[Server] Listening on http://localhost:${port}`);
});
