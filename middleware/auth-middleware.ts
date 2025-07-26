require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare module "express-serve-static-core" {
    interface Request {
        userId?: string;
    }
}

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(400).json({ success: false, message: 'Please Login to access' });
    }

    const decodedData: any = jwt.verify(token, process.env.SECRET_KEY!);

    req.userId = decodedData.id;

    next();
}
