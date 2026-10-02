import { PDFParse } from 'pdf-parse';

function cleanResumeText(text) {
	return text
		.replace(/\r\n?/g, '\n')
		.replace(/\f/g, '\n')
		.replace(/^[ \t]*(?:page[ \t]*[:#]?[ \t]*\d+(?:[ \t]+(?:of|\/)[ \t]*\d+)?|--[ \t]*\d+(?:[ \t]+(?:of|\/)[ \t]*\d+)?[ \t]*--)[ \t]*$/gim, '')
		.replace(/[ \t]+\n/g, '\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

export async function readResume(pdfBuffer) {
	if (!Buffer.isBuffer(pdfBuffer)) {
		throw new TypeError('Resume PDF data must be a buffer.');
	}

	const parser = new PDFParse({ data: new Uint8Array(pdfBuffer) });

	try {
		const result = await parser.getText();
		return cleanResumeText(result.text ?? '');
	} finally {
		await parser.destroy();
	}
}
