import type { NextFunction, Request, Response } from 'express';

export function allowHostMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Override host header to bypass Vite's host checking
  if (req.headers.host && req.headers.host.includes('replit.dev')) {
    req.headers.host = 'localhost:5000';
    req.headers['x-forwarded-host'] = req.headers.host;
  }
  
  // Add CORS headers for Replit domains
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  next();
}
