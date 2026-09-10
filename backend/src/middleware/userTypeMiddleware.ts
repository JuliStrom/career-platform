import { Response, NextFunction } from "express";
import { AuthRequest, UserType } from "../types";

const userTypeMiddleware = (allowedTypes: UserType[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Пользователь не авторизован" });
        return;
      }

      if (!req.user.userType || !allowedTypes.includes(req.user.userType)) {
        res.status(403).json({
          error: "Доступно только для заказчика",
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default userTypeMiddleware;
