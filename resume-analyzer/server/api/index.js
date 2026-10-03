import app from '../index.js';
import { connectToDatabase } from '../lib/db.js';

export default async function handler(request, response) {
  await connectToDatabase();
  return app(request, response);
}
