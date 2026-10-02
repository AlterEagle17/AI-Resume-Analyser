import 'dotenv/config';
import express from 'express';
import analyzeRouter from './routes/analyze.js';
import { errorHandler } from './middleware/errors.js';

const app = express();
const port = Number(process.env.PORT) || 3000;

app.get('/api/health', (_request, response) => {
  response.status(200).json({ status: 'ok' });
});

app.use('/api/analyze', analyzeRouter);
app.use(errorHandler);

app.listen(port, () => {
  console.info(`[Server] Listening on http://localhost:${port}`);
});
