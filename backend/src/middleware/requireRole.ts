import type { Request, Response, NextFunction } from 'express';

type UserRole = 'admin' | 'operator' | 'viewer';

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role as UserRole | undefined;

    if (!role) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        message: `Role '${role}' cannot perform this action`,
        details: [`Allowed roles: ${allowedRoles.join(', ')}`]
      });
    }

    next();
  };
}
