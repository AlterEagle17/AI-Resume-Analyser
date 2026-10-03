import Analysis from '../models/Analysis.js';
import User from '../models/User.js';
import { isDatabaseConnected } from './db.js';

export function isValidUserId(userId) {
  return typeof userId === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId);
}

export async function touchAnonymousUser(userId) {
  if (!isDatabaseConnected()) return false;

  const now = new Date();
  try {
    await User.updateOne(
      { userId },
      {
        $set: { lastActiveAt: now },
        $setOnInsert: { userId, createdAt: now },
      },
      { upsert: true, runValidators: true },
    );
    return true;
  } catch (error) {
    if (error.code !== 11000) {
      console.error('[DB] Failed to update anonymous user.');
      return false;
    }

    try {
      await User.updateOne({ userId }, { $set: { lastActiveAt: now } }, { runValidators: true });
      return true;
    } catch {
      console.error('[DB] Failed to update anonymous user.');
      return false;
    }
  }
}

export async function saveAnalysisForUser(userId, analysis) {
  if (!isDatabaseConnected()) return false;
  if (!await touchAnonymousUser(userId)) return false;

  try {
    await Analysis.create({
      userId,
      targetRole: analysis.targetRole,
      score: analysis.score,
      verdict: analysis.verdict,
      skillsFound: analysis.skillsFound,
      skillsMissing: analysis.skillsMissing,
      topFixes: analysis.topFixes,
      fallback: analysis.fallback,
      inputTokens: analysis.inputTokens,
      outputTokens: analysis.outputTokens,
      costInr: analysis.costInr,
    });
    return true;
  } catch {
    console.error('[DB] Failed to save analysis history.');
    return false;
  }
}

export async function getUserHistory(userId) {
  if (!isDatabaseConnected()) {
    const error = new Error('Database is unavailable.');
    error.code = 'DATABASE_UNAVAILABLE';
    throw error;
  }

  const user = await User.findOne({ userId })
    .select({ _id: 0, userId: 1, createdAt: 1, lastActiveAt: 1 })
    .lean();

  if (!user) return null;

  const analyses = await Analysis.find({ userId })
    .select({
      _id: 0,
      targetRole: 1,
      score: 1,
      verdict: 1,
      skillsFound: 1,
      skillsMissing: 1,
      topFixes: 1,
      fallback: 1,
      inputTokens: 1,
      outputTokens: 1,
      costInr: 1,
      createdAt: 1,
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return { user, analyses };
}
