import Groq from 'groq-sdk';
import {
	MAX_COMPLETION_TOKENS_PER_ATTEMPT,
	getConfiguredModel,
	reserveGroqAttempt,
	settleGroqAttempt,
} from './costs.js';

let groqClient;

function getGroqClient() {
	const apiKey = process.env.GROQ_API_KEY;
	if (!apiKey) {
		const error = new Error('GROQ_API_KEY is not configured in the server environment.');
		error.code = 'MISSING_GROQ_API_KEY';
		throw error;
	}

	if (!groqClient) {
		groqClient = new Groq({ apiKey });
	}

	return groqClient;
}

export async function askGroq(messages) {
	const model = getConfiguredModel();
	const costReservation = reserveGroqAttempt(messages, model);
	let completion;

	try {
		completion = await getGroqClient().chat.completions.create({
			model,
			messages,
			temperature: 0.2,
			max_completion_tokens: MAX_COMPLETION_TOKENS_PER_ATTEMPT,
			response_format: { type: 'json_object' },
		});
	} catch (error) {
		const inputTokens = error.usage?.inputTokens ?? error.usage?.prompt_tokens ?? error.usage?.input_tokens;
		const outputTokens = error.usage?.outputTokens ?? error.usage?.completion_tokens ?? error.usage?.output_tokens;
		const settlement = settleGroqAttempt(
			costReservation,
			inputTokens ?? 0,
			outputTokens ?? 0,
			inputTokens === undefined || outputTokens === undefined,
		);
		error.usage = {
			inputTokens: inputTokens ?? 0,
			outputTokens: outputTokens ?? 0,
			costInr: settlement.actualCostInr,
		};
		throw error;
	}

	const inputTokens = completion.usage?.prompt_tokens ?? completion.usage?.input_tokens;
	const outputTokens = completion.usage?.completion_tokens ?? completion.usage?.output_tokens;
	const settlement = settleGroqAttempt(
		costReservation,
		inputTokens ?? 0,
		outputTokens ?? 0,
		inputTokens === undefined || outputTokens === undefined,
	);

	const content = completion.choices[0]?.message?.content;
	if (typeof content !== 'string' || !content.trim()) {
		const error = new Error('Groq returned an empty analysis response.');
		error.code = 'EMPTY_GROQ_RESPONSE';
		error.usage = {
			inputTokens: inputTokens ?? 0,
			outputTokens: outputTokens ?? 0,
			costInr: settlement.actualCostInr,
		};
		throw error;
	}

	return {
		content,
		inputTokens: inputTokens ?? 0,
		outputTokens: outputTokens ?? 0,
		costInr: settlement.actualCostInr,
	};
}
