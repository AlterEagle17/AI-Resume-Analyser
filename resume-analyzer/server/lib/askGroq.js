import Groq from 'groq-sdk';

const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-20b';
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
	const model = process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;
	let completion;

	try {
		completion = await getGroqClient().chat.completions.create({
			model,
			messages,
			temperature: 0.2,
			response_format: { type: 'json_object' },
		});
	} catch (error) {
		if (error.code !== 'MISSING_GROQ_API_KEY') {
			console.error('[AI] Groq request failed:', {
				status: error.status ?? null,
				code: error.code ?? 'GROQ_REQUEST_FAILED',
			});
		}
		throw error;
	}

	const content = completion.choices[0]?.message?.content;
	if (typeof content !== 'string' || !content.trim()) {
		const error = new Error('Groq returned an empty analysis response.');
		error.code = 'EMPTY_GROQ_RESPONSE';
		throw error;
	}

	return content;
}
