import multer from 'multer';

export class ApiError extends Error {
	constructor(statusCode, message) {
		super(message);
		this.name = 'ApiError';
		this.statusCode = statusCode;
	}
}

export function errorHandler(error, _request, response, next) {
	if (response.headersSent) {
		return next(error);
	}

	if (error instanceof multer.MulterError) {
		console.warn(`[Upload] Multer rejected request: ${error.code}`);
		if (error.code === 'LIMIT_FILE_SIZE') {
			return response.status(413).json({ error: 'PDF must be 4 MB or smaller.' });
		}
		if (error.code === 'LIMIT_UNEXPECTED_FILE') {
			return response.status(400).json({ error: 'Unexpected file field. Upload the PDF using the "resume" field.' });
		}

		return response.status(400).json({ error: 'Invalid multipart upload. Check the uploaded file and form fields.' });
	}

	if (error instanceof ApiError) {
		return response.status(error.statusCode).json({ error: error.message });
	}

	console.error('[Server] Unexpected request error:', error.message);
	return response.status(500).json({ error: 'An unexpected server error occurred.' });
}
