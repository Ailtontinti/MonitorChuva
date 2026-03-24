import { NextFunction, Request, Response } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  // eslint-disable-next-line no-console
  console.error(err);

  return res.status(500).json({
    message: 'Ocorreu um erro interno. Tente novamente mais tarde.'
  });
};

