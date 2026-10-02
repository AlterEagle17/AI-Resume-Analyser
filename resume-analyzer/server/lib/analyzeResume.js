import { buildAnalysisMessages } from './analyzerRules.js';
import { InvalidAnalysisResponseError, parseAnalysisResponse } from './analysisSchema.js';
import { askGroq } from './askGroq.js';

function getVerdict(score) {
	if (score >= 80) return 'Strong match';
	if (score >= 60) return 'Good potential';
	return 'Needs improvement';
}

export async function analyzeResume(text, targetRole) {
	const messages = buildAnalysisMessages(text, targetRole);
	const content = await askGroq(messages);

	let analysis;
	try {
		analysis = parseAnalysisResponse(content);
	} catch (error) {
		if (error instanceof InvalidAnalysisResponseError) {
			console.error('[AI] Rejected an invalid structured analysis response.');
		}
		throw error;
	}

	const score = Math.round(Math.max(0, Math.min(100, analysis.score)));
	return {
		score,
		verdict: getVerdict(score),
		targetRole,
		skillsFound: analysis.skillsFound,
		skillsMissing: analysis.skillsMissing,
		topFixes: analysis.topFixes,
	};
}
