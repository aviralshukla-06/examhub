import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";



export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

//------------------------







export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    console.log("=== AUTH DEBUG ===");
    console.log("AUTH HEADER:", req.headers.authorization);
    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    console.log("=================");



    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "No token provided" });
        return;
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;

    console.log("Token received:", token);
    console.log("Secret:", process.env.JWT_SECRET);

    if (!secret) {
        res.status(500).json({ message: "Server config error" });
        return;
    }

    try {
        const decoded = jwt.verify(token, secret) as {
            id: string;
            email: string;
        };
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};