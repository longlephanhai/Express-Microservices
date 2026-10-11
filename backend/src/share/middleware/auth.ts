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
            userId?: string;
            userRole?: string;
            requester?: Requester;
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    // If request has forwarded identity from trusted API Gateway
    const forwardedUserId = req.headers["x-user-id"] as string;
    const forwardedUserRole = (req.headers["x-user-role"] as string) || "user";
    if (forwardedUserId) {
        req.userId = forwardedUserId;
        req.userRole = forwardedUserRole;
        req.requester = { sub: forwardedUserId, role: forwardedUserRole };
        next();
        return;
    }

    const internalSecret = process.env.INTERNAL_SERVICE_KEY || process.env.JWT_SECRET || "just_jwt_secret_key";
    const internalHeader = req.headers["x-internal-service"];

    if (internalHeader && internalHeader === internalSecret) {
        req.userId = "internal-system";
        req.userRole = "admin";
        req.requester = {
            sub: "internal-system",
            role: "admin",
        };
        next();
        return;
    }

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

    const jwtSecret = process.env.JWT_SECRET || "just_jwt_secret_key";

    try {
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

        const sub = decoded.sub as string;
        const role = (decoded.role || "user") as string;

        req.userId = sub;
        req.userRole = role;

        const requester: Requester = {
            sub,
            role,
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
        const userRole = req.userRole || req.requester?.role;

        if (!userRole) {
            res.status(401).json({
                message: "Unauthorized: User not authenticated",
            });
            return;
        }

        if (roles.length > 0 && !roles.includes(userRole)) {
            res.status(403).json({
                message: "Forbidden: You do not have permission to access this resource",
            });
            return;
        }

        next();
    };
};

