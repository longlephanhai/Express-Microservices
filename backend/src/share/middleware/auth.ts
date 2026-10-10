import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface Requester {
    sub: string; 
    role: string; 
    [key: string]: any;
}

declare global {
    namespace Express {
        interface Request {
            requester?: Requester;
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({
            message: "Unauthorized: Missing Authorization header",
        });
        return;
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        res.status(401).json({
            message: "Unauthorized: Invalid authorization format. Expected 'Bearer <token>'",
        });
        return;
    }

    const token = parts[1];
    if (!token) {
        res.status(401).json({
            message: "Unauthorized: Token is missing",
        });
        return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        res.status(500).json({
            message: "Internal server error: JWT_SECRET is not configured",
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

        const requester: Requester = {
            sub: decoded.sub as string,
            role: decoded.role as string,
            ...decoded,
        };

        req.requester = requester;

        next();
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            res.status(401).json({
                message: "Unauthorized: Token has expired",
            });
            return;
        }

        res.status(401).json({
            message: "Unauthorized: Invalid token",
        });
        return;
    }
};

export const requireRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const requester = req.requester;

        if (!requester) {
            res.status(401).json({
                message: "Unauthorized: User not authenticated",
            });
            return;
        }

        if (roles.length > 0 && !roles.includes(requester.role)) {
            res.status(403).json({
                message: "Forbidden: You do not have permission to access this resource",
            });
            return;
        }

        next();
    };
};

