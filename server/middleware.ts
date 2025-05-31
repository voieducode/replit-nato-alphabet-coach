import type { Request, Response, NextFunction } from 'express';

export function allowHostMiddleware(req: Request, res: Response, next: NextFunction) {
  // Override host header to bypass Vite's host checking
  if (req.headers.host && req.headers.host.includes('replit.dev')) {
    req.headers.host = 'localhost:5000';
  }
  next();
}