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
		if (error.code === 'LIMIT_FILE_SIZE') {
			return response.status(413).json({ error: 'PDF must be 4 MB or smaller.' });
		}

		return response.status(400).json({ error: 'Invalid file upload.' });
	}

	if (error instanceof ApiError) {
		return response.status(error.statusCode).json({ error: error.message });
	}

	console.error('[Server] Unexpected request error:', error.message);
	return response.status(500).json({ error: 'An unexpected server error occurred.' });
}
