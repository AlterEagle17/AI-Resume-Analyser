import { buildAnalysisMessages } from './analyzerRules.js';
import { analysisResultSchema, InvalidAnalysisResponseError, parseAnalysisResponse } from './analysisSchema.js';
import { askGroq } from './askGroq.js';
import { getRelevantSkills } from './roles.js';

const MAX_AI_ATTEMPTS = 2;
const FALLBACK_VERDICT = 'AI is busy, showing a skill match only';
const ROLE_WORDS_TO_IGNORE = new Set([
	'developer', 'engineer', 'analyst', 'architect', 'specialist', 'designer',
	'manager', 'administrator', 'consultant', 'scientist', 'lead', 'senior',
	'junior', 'principal', 'staff', 'frontend', 'backend', 'full', 'stack',
	'ai', 'data', 'software', 'programmer', 'technical',
]);

function safeErrorDetails(error, resumeText, targetRole) {
	const name = typeof error?.name === 'string' ? error.name : 'Error';
	const rawCode = error?.code ?? error?.error?.code;
	const code = typeof rawCode === 'string' ? rawCode : 'UNKNOWN';
	const status = Number.isInteger(error?.status) ? ` status=${error.status}` : '';
	const rawMessage = error?.error?.message ?? error?.message;
	const message = typeof rawMessage === 'string' ? rawMessage : 'Request failed.';
	let safeMessage = message
		.replace(/gsk_[A-Za-z0-9_-]+/g, '[redacted]')
		.replace(/Bearer\s+\S+/gi, 'Bearer [redacted]')
		.replace(/mongodb(?:\+srv)?:\/\/\S+/gi, '[redacted connection string]')
		.replace(/https?:\/\/\S+/gi, '[redacted URL]')
		.slice(0, 240);
	for (const untrustedValue of [resumeText, targetRole]) {
		if (untrustedValue) safeMessage = safeMessage.replaceAll(untrustedValue, '[redacted user data]');
	}
	return `${name}/${code}${status}: ${safeMessage}`;
}

function shouldRetry(error) {
	const code = error?.code ?? error?.error?.code;
	if (code === 'json_validate_failed') return true;
	return ![400, 401, 403, 404, 413, 422].includes(error?.status);
}

function getVerdict(score) {
	if (score >= 80) return 'Strong match';
	if (score >= 60) return 'Good potential';
	return 'Needs improvement';
}

function getFallbackSkills(targetRole) {
	const knownSkills = getRelevantSkills(targetRole);
	if (knownSkills) return knownSkills;

	return [...new Set(
		targetRole
			.toLowerCase()
			.match(/[a-z0-9+#.]+/g)
			?.filter((word) => word.length > 1 && !ROLE_WORDS_TO_IGNORE.has(word)) ?? [],
	)];
}

function createFallback(text, targetRole, inputTokens, outputTokens, costInr) {
	const relevantSkills = getFallbackSkills(targetRole);
	const resume = text.toLocaleLowerCase();
	const skillsFound = relevantSkills.filter((skill) => skillMatchesText(skill, resume));
	const skillsMissing = relevantSkills.filter((skill) => !skillMatchesText(skill, resume));
	const topFixes = skillsMissing
		.slice(0, 3)
		.map((skill) => `Add clear evidence of ${skill} in your experience or projects.`);

	if (topFixes.length === 0) {
		topFixes.push('Add measurable outcomes to your most relevant experience.');
	}

	return analysisResultSchema.parse({
		score: null,
		verdict: FALLBACK_VERDICT,
		targetRole,
		skillsFound,
		skillsMissing,
		topFixes: topFixes.slice(0, 3),
		fallback: true,
		inputTokens,
		outputTokens,
		costInr,
	});
}

function skillMatchesText(skill, resumeText) {
	return skill.split(/\s+or\s+/i).some((alternative) => {
		const escaped = alternative.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'i').test(resumeText);
	});
}

function addUsage(total, usage = {}) {
	const inputTokens = usage.inputTokens ?? usage.prompt_tokens ?? usage.input_tokens;
	const outputTokens = usage.outputTokens ?? usage.completion_tokens ?? usage.output_tokens;
	return {
		inputTokens: total.inputTokens + (Number.isInteger(inputTokens) ? inputTokens : 0),
		outputTokens: total.outputTokens + (Number.isInteger(outputTokens) ? outputTokens : 0),
		costInr: total.costInr + (Number.isFinite(usage.costInr) ? usage.costInr : 0),
	};
}

export async function analyzeResume(text, targetRole, requestAnalysis = askGroq) {
	const messages = buildAnalysisMessages(text, targetRole);
	let usage = { inputTokens: 0, outputTokens: 0, costInr: 0 };

	for (let attempt = 1; attempt <= MAX_AI_ATTEMPTS; attempt += 1) {
		try {
			const result = await requestAnalysis(messages);
			usage = addUsage(usage, result);
			const analysis = parseAnalysisResponse(result.content);
			const score = Math.round(Math.max(0, Math.min(100, analysis.score)));

			return analysisResultSchema.parse({
				...analysis,
				score,
				verdict: getVerdict(score),
				targetRole,
				fallback: false,
				...usage,
			});
		} catch (error) {
			if (error.usage) usage = addUsage(usage, error.usage);
			if (error.code === 'DAILY_AI_BUDGET_EXCEEDED' || error.code === 'COST_MODEL_NOT_CONFIGURED') {
				return createFallback(text, targetRole, usage.inputTokens, usage.outputTokens, usage.costInr);
			}
			if (error instanceof InvalidAnalysisResponseError) {
				console.error(`[AI] schema validation failed: fields=${error.fields.join(',') || '(unknown)'}`);
			}
			console.error(`[AI] attempt ${attempt} failed: ${safeErrorDetails(error, text, targetRole)}`);
			if (attempt === MAX_AI_ATTEMPTS || !shouldRetry(error)) {
				return createFallback(text, targetRole, usage.inputTokens, usage.outputTokens, usage.costInr);
			}
		}
	}
}
