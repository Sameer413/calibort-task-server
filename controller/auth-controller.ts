require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import { dbClient } from "../config/db";
import bcrypt from "bcrypt";
import generateToken from "../utils/auth-token";
import { IUser } from "../types/type";

type IRegisterUser = {
    name: string
    email: string;
    password: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, name } = req.body as IRegisterUser;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: `Please fill the field${!email ? ' email' : ''}${!password ? ' password' : ''}`
            });
        }

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: "Invalid email format"
            });
        }

        const existUser = await dbClient.query('SELECT * FROM users where email = $1', [email]);

        if (existUser.rows.length > 0) {
            return res.status(409).json({ error: 'User already exists with this email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertUser = await dbClient.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, email, created_at',
            [name, email, hashedPassword]
        );

        const user: IUser = insertUser.rows[0];

        return res.status(201).json({
            success: true,
            message: "User Created successfully.",
        });

    } catch (error: any) {
        console.error('Register Error:', error.message);
        res.status(500).json({ error: 'Server error during registration' });
    }
}

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body as IRegisterUser;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: `Please fill the field${!email ? ' email' : ''}${!password ? ' password' : ''}`
            });
        }

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: "Invalid email format"
            });
        }

        const existUser = await dbClient.query('SELECT * FROM users WHERE email = $1', [email]);

        if (existUser.rows.length === 0) {
            return res.status(404).json({ error: 'User not found with this email' });
        }

        const user = existUser.rows[0];

        const matchPassword = await bcrypt.compare(password, user.password);

        if (!matchPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken({ id: user.id, email: user.email });

        res.cookie('token', token, {
            expires: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none'
        });

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                image_url: user.image_url,
                created_at: user.created_at
            },
        });

    } catch (error: any) {
        console.error('Register Error:', error.message);
        res.status(500).json({ error: 'Server error during registration' });
    }
}