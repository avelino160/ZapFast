// Vercel Serverless Function Entry Point
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Import the backend server dynamically to ensure it's initialized properly
  const { default: serverHandler } = await import('../backend/server/index.js');
  
  // Call the server handler with Vercel request/response
  return serverHandler(req as any, res as any);
}