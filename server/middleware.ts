import type { NextFunction, Request, Response } from 'express';

export function allowHostMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Override host header to bypass Vite's host checking for all requests
  const originalHost = req.headers.host;
  if (
    originalHost &&
    (originalHost.includes('replit.dev') || originalHost.includes('repl.co'))
  ) {
    req.headers.host = 'localhost:5000';
    req.headers['x-forwarded-host'] = originalHost;
  }

  // Also set headers to disable host checking
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  next();
}
