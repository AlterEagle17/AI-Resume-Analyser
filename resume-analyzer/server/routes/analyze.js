import { Router } from 'express';
import multer from 'multer';
import { isTargetRole, TARGET_ROLES } from '../lib/roles.js';
import { readResume } from '../lib/readResume.js';
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

	const targetRole = request.body?.targetRole;
	if (!isTargetRole(targetRole)) {
		return next(
			new ApiError(400, `Invalid target role. Choose one of: ${TARGET_ROLES.join(', ')}.`),
		);
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

	return response.status(200).json({
		targetRole,
		characters: text.length,
		preview: text.slice(0, 300),
	});
});

export default router;
