import { z } from 'zod';

const normalAnalysisSchema = z.object({
	score: z.number().finite().min(0).max(100),
	skillsFound: z.array(z.string().trim().min(1)),
	skillsMissing: z.array(z.string().trim().min(1)),
	topFixes: z.array(z.string().trim().min(1)).length(3),
}).strict();

const fallbackAnalysisSchema = z.object({
	score: z.null(),
	verdict: z.literal('AI is busy, showing a skill match only'),
	targetRole: z.string().trim().min(1).max(100),
	skillsFound: z.array(z.string().trim().min(1)),
	skillsMissing: z.array(z.string().trim().min(1)),
	topFixes: z.array(z.string().trim().min(1)).max(3),
	fallback: z.literal(true),
	inputTokens: z.number().int().nonnegative(),
	outputTokens: z.number().int().nonnegative(),
	costInr: z.number().finite().nonnegative(),
}).strict();

const normalResultSchema = normalAnalysisSchema.extend({
	verdict: z.string().min(1),
	targetRole: z.string().trim().min(1).max(100),
	fallback: z.literal(false),
	inputTokens: z.number().int().nonnegative(),
	outputTokens: z.number().int().nonnegative(),
	costInr: z.number().finite().nonnegative(),
}).strict();

const analysisResultSchema = z.discriminatedUnion('fallback', [
	normalResultSchema,
	fallbackAnalysisSchema,
]);

export class InvalidAnalysisResponseError extends Error {
	constructor(fields = []) {
		super('The AI returned an invalid analysis response.');
		this.name = 'InvalidAnalysisResponseError';
		this.code = 'INVALID_ANALYSIS_RESPONSE';
		this.fields = fields;
	}
}

export function parseAnalysisResponse(content) {
	let value;
	try {
		value = JSON.parse(content);
	} catch {
		throw new InvalidAnalysisResponseError();
	}

	const result = normalAnalysisSchema.safeParse(value);
	if (!result.success) {
		const fields = [...new Set(result.error.issues.map((issue) => issue.path.join('.') || '(root)'))];
		throw new InvalidAnalysisResponseError(fields);
	}

	return result.data;
}

export const analysisSchema = normalAnalysisSchema;
export { analysisResultSchema };
