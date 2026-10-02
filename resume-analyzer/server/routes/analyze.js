import { Router } from 'express';
import multer from 'multer';
import { readResume } from '../lib/readResume.js';
import { analyzeResume } from '../lib/analyzeResume.js';
import { InvalidAnalysisResponseError } from '../lib/analysisSchema.js';
import { ApiError } from '../middleware/errors.js';

const MAX_PDF_SIZE_BYTES = 4 * 1024 * 1024;
const router = Router();

const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: MAX_PDF_SIZE_BYTES,
		files: 1,
		fields: 1,
		fieldSize: 128,
	},
	fileFilter(_request, file, callback) {
		if (file.mimetype !== 'application/pdf') {
			callback(new ApiError(400, 'Only PDF files are accepted.'));
			return;
		}

		callback(null, true);
	},
});

router.post('/', upload.single('resume'), async (request, response, next) => {
	if (!request.file) {
		return next(new ApiError(400, 'A resume PDF is required.'));
	}

	const submittedRole = request.body?.targetRole;
	if (typeof submittedRole !== 'string' || !submittedRole.trim()) {
		return next(new ApiError(400, 'Enter the job role you are applying for.'));
	}
	const targetRole = submittedRole.trim();
	if (targetRole.length > 100) {
		return next(new ApiError(400, 'Target job role must be 100 characters or fewer.'));
	}

	let text;
	try {
		text = await readResume(request.file.buffer);
	} catch {
		return next(
			new ApiError(400, 'Unable to extract text from this PDF. Make sure it is a valid, readable PDF.'),
		);
	}

	if (text.length < 100) {
		return next(
			new ApiError(422, 'This PDF contains too little extractable text. Use a text-based PDF resume.'),
		);
	}

	try {
		const result = await analyzeResume(text, targetRole);
		return response.status(200).json({ ...result, characters: text.length });
	} catch (error) {
		if (error instanceof InvalidAnalysisResponseError) {
			return next(new ApiError(502, 'The AI returned an invalid analysis. Please try again.'));
		}

		if (error.code === 'MISSING_GROQ_API_KEY') {
			console.error('[AI] GROQ_API_KEY is not configured on the server.');
			return next(new ApiError(503, 'Resume analysis is not configured on the server yet.'));
		}

		return next(new ApiError(502, 'Resume analysis is temporarily unavailable. Please try again.'));
	}
});

export default router;
