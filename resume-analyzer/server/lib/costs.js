const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-20b';
const DEFAULT_DAILY_BUDGET_INR = 100;
const USD_TO_INR = 96.19;
const TOKENS_PER_MILLION = 1_000_000;

export const MAX_COMPLETION_TOKENS_PER_ATTEMPT = 2048;

const GROQ_PRICING_USD_PER_MILLION = Object.freeze({
	'openai/gpt-oss-20b': Object.freeze({
		// Groq model pricing: https://console.groq.com/docs/model/openai/gpt-oss-20b
		input: 0.075,
		output: 0.30,
	}),
});

// XE mid-market USD/INR reference captured 2026-10-03: https://www.xe.com/currencyconverter/convert/?Amount=1&From=USD&To=INR

export function getConfiguredModel() {
	return process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;
}

function getPricing(model) {
	const pricing = GROQ_PRICING_USD_PER_MILLION[model];
	if (!pricing) {
		const error = new Error('Pricing is not configured for the selected Groq model.');
		error.code = 'COST_MODEL_NOT_CONFIGURED';
		throw error;
	}
	return pricing;
}

export function calculateCostInr(inputTokens, outputTokens, model = getConfiguredModel()) {
	if (!Number.isFinite(inputTokens) || inputTokens < 0 || !Number.isFinite(outputTokens) || outputTokens < 0) {
		throw new TypeError('Token counts must be non-negative finite numbers.');
	}

	const pricing = getPricing(model);
	const inputCostUsd = (inputTokens / TOKENS_PER_MILLION) * pricing.input;
	const outputCostUsd = (outputTokens / TOKENS_PER_MILLION) * pricing.output;
	return (inputCostUsd + outputCostUsd) * USD_TO_INR;
}

export function getDailyBudgetInr() {
	const budgetValue = process.env.DAILY_AI_BUDGET_INR?.trim();
	if (!budgetValue) return DEFAULT_DAILY_BUDGET_INR;

	const configuredBudget = Number(budgetValue);
	return Number.isFinite(configuredBudget) && configuredBudget >= 0
		? configuredBudget
		: DEFAULT_DAILY_BUDGET_INR;
}

export function getIstCalendarDate(date = new Date()) {
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Asia/Kolkata',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).formatToParts(date);
	const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
	return `${values.year}-${values.month}-${values.day}`;
}

export function createDailySpendingTracker({ getDate = getIstCalendarDate, getBudget = getDailyBudgetInr } = {}) {
	let current = { date: getDate(), spentInr: 0, reservedInr: 0, generation: 0 };

	function refreshDate() {
		const date = getDate();
		if (current.date !== date) {
			current = { date, spentInr: 0, reservedInr: 0, generation: current.generation + 1 };
		}
	}

	return {
		reserve(estimatedCostInr) {
			refreshDate();
			if (!Number.isFinite(estimatedCostInr) || estimatedCostInr < 0) return null;
			if (current.spentInr + current.reservedInr + estimatedCostInr > getBudget()) return null;

			current.reservedInr += estimatedCostInr;
			return { date: current.date, generation: current.generation, estimatedCostInr };
		},
		settle(reservation, actualCostInr) {
			refreshDate();
			if (reservation.generation === current.generation) {
				current.reservedInr = Math.max(0, current.reservedInr - reservation.estimatedCostInr);
			}
			current.spentInr += Number.isFinite(actualCostInr) && actualCostInr >= 0
				? actualCostInr
				: reservation.estimatedCostInr;
			return this.snapshot();
		},
		snapshot() {
			refreshDate();
			return {
				date: current.date,
				spentInr: current.spentInr,
				reservedInr: current.reservedInr,
				budgetInr: getBudget(),
			};
		},
	};
}

const dailySpendingTracker = createDailySpendingTracker();

function estimatePromptTokens(messages) {
	const serializedMessages = messages.map(({ role, content }) => `${role}: ${content}`).join('\n');
	return Buffer.byteLength(serializedMessages, 'utf8') + 32;
}

export function reserveGroqAttempt(messages, model = getConfiguredModel()) {
	const estimatedInputTokens = estimatePromptTokens(messages);
	const estimatedCostInr = calculateCostInr(
		estimatedInputTokens,
		MAX_COMPLETION_TOKENS_PER_ATTEMPT,
		model,
	);
	const snapshot = dailySpendingTracker.snapshot();
	const allowed = snapshot.spentInr + snapshot.reservedInr + estimatedCostInr <= snapshot.budgetInr;
	console.info(`[AI] budget check: allowed=${allowed}`);
	console.info(`[AI] current spend: ${snapshot.spentInr.toFixed(6)}`);
	console.info(`[AI] estimated request cost: ${estimatedCostInr.toFixed(6)}`);
	console.info(`[AI] daily budget: ${snapshot.budgetInr.toFixed(6)}`);
	console.info(`[Cost] estimated request cost: ₹${estimatedCostInr.toFixed(6)}`);

	const reservation = dailySpendingTracker.reserve(estimatedCostInr);
	if (!reservation) {
		console.warn('[Cost] daily budget reached');
		const error = new Error('The daily AI budget has been reached.');
		error.code = 'DAILY_AI_BUDGET_EXCEEDED';
		throw error;
	}

	return { reservation, estimatedInputTokens, estimatedCostInr };
}

export function settleGroqAttempt(reservation, inputTokens, outputTokens, useEstimate = false) {
	const actualCostInr = useEstimate
		? reservation.estimatedCostInr
		: calculateCostInr(inputTokens, outputTokens);
	const snapshot = dailySpendingTracker.settle(reservation, actualCostInr);
	console.info(`[Cost] daily spent: ₹${snapshot.spentInr.toFixed(6)} / ₹${snapshot.budgetInr.toFixed(2)}`);
	return { ...snapshot, actualCostInr };
}

export function getDailySpendingSnapshot() {
	return dailySpendingTracker.snapshot();
}