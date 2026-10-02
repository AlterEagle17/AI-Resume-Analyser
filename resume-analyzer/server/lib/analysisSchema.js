import { z } from 'zod';

const analysisSchema = z.object({
	score: z.number().finite().min(0).max(100),
	skillsFound: z.array(z.string().trim().min(1)),
	skillsMissing: z.array(z.string().trim().min(1)),
	topFixes: z.array(z.string().trim().min(1)).length(3),
}).strict();

export class InvalidAnalysisResponseError extends Error {
	constructor() {
		super('The AI returned an invalid analysis response.');
		this.name = 'InvalidAnalysisResponseError';
		this.code = 'INVALID_ANALYSIS_RESPONSE';
	}
}

export function parseAnalysisResponse(content) {
	let value;
	try {
		value = JSON.parse(content);
	} catch {
		throw new InvalidAnalysisResponseError();
	}

	const result = analysisSchema.safeParse(value);
	if (!result.success) {
		throw new InvalidAnalysisResponseError();
	}

	return result.data;
}

export { analysisSchema };
