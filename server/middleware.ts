import type { NextFunction, Request, Response } from 'express';

export function allowHostMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Completely bypass host checking for Replit domains
  if (req.headers.host && req.headers.host.includes('replit.dev')) {
    // Set multiple headers to ensure compatibility
    req.headers.host = 'localhost';
    req.headers['x-forwarded-host'] = 'localhost';
    req.headers['x-real-ip'] = '127.0.0.1';
    req.headers['x-forwarded-for'] = '127.0.0.1';
  }
  
  // Set environment variable for this request
  process.env.DANGEROUSLY_DISABLE_HOST_CHECK = 'true';
  
  // Add comprehensive CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Host');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
}
