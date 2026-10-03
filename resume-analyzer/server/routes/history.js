import { Router } from 'express';
import { getUserHistory, isValidUserId } from '../lib/analysisHistory.js';
import { isDatabaseConnected } from '../lib/db.js';

const router = Router();

router.get('/:userId', async (request, response) => {
  const { userId } = request.params;
  console.info('[History] history route reached:', { userId });
  if (!isValidUserId(userId)) {
    return response.status(400).json({ error: 'A valid anonymous user ID is required.' });
  }

  if (!isDatabaseConnected()) {
    return response.status(503).json({ error: 'Analysis history is temporarily unavailable.' });
  }

  try {
    const history = await getUserHistory(userId);
    return response.status(200).json(history ?? { user: null, analyses: [] });
  } catch {
    console.error('[DB] Failed to load analysis history.');
    return response.status(503).json({ error: 'Analysis history is temporarily unavailable.' });
  }
});

export default router;
