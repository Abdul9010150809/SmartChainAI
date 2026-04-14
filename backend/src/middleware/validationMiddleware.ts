import type { Request, Response, NextFunction } from 'express';
import type { ObjectSchema } from 'joi';

export function validate(schema: ObjectSchema, property: 'body' | 'params' | 'query' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], { abortEarly: false, stripUnknown: true });

    if (error) {
      return res.status(400).json({
        message: 'Validation failed',
        details: error.details.map((detail) => {
          const field = detail.path.length ? detail.path.join('.') : 'request';
          return `${field}: ${detail.message}`;
        })
      });
    }

    req[property] = value;
    next();
  };
}