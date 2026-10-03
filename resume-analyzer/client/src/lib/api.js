export async function analyzeResume(file, targetRole, userId) {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('targetRole', targetRole.trim());
  formData.append('userId', userId);

  let response;
  try {
    response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
    });
  } catch {
    throw new Error('Could not connect to the analysis server. Check that the server is running and try again.');
  }

  let result;
  try {
    result = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error('The analysis server is unavailable. Check that the server is running and try again.');
    }

    throw new Error('The server returned an unreadable response. Please try again.');
  }

  if (!response.ok) {
    throw new Error(result.error || 'The resume could not be analyzed. Please try again.');
  }

  return result;
}

export async function getAnalysisHistory(userId) {
  let response;
  try {
    response = await fetch(`/api/history/${encodeURIComponent(userId)}`);
  } catch {
    throw new Error('Analysis history is temporarily unavailable.');
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('Analysis history is temporarily unavailable.');
  }

  if (!response.ok) {
    throw new Error(result.error || 'Analysis history is temporarily unavailable.');
  }

  return result;
}