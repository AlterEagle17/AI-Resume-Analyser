const USER_ID_STORAGE_KEY = 'resume_analyzer_user_id';

export function getOrCreateUserId() {
  const existingUserId = window.localStorage.getItem(USER_ID_STORAGE_KEY);
  if (existingUserId) return existingUserId;

  const userId = window.crypto.randomUUID();
  window.localStorage.setItem(USER_ID_STORAGE_KEY, userId);
  return userId;
}
