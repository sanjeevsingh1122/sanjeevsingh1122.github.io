import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
};

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const status = (err as any).status || 500;
  const message = err.message || 'Something went wrong';
  console.error(err);
  res.status(status).json({ message });
};
