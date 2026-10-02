export async function analyzeResume(file, targetRole) {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('targetRole', targetRole.trim());

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