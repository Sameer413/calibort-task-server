import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { dbClient } from "./config/db";
import { createUsersTable } from "./config/tableInit";
import router from "./routes/route";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config()

const app = express();
const PORT = process.env.PORT || 5555;

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

app.use(router);

app.get('/test', (req: Request, res: Response) => {
    return res.status(200).json({
        success: true,
        message: "Server is working"
    })
})

app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({
        success: true,
        message: "Server is working"
    })
})

async function initializeDatabase() {
    try {
        await dbClient.connect();
        console.log("Database connected successfully");

        await createUsersTable();
        console.log("Database tables initialized");
    } catch (error) {
        console.error("Database initialization failed:", error);
        process.exit(1); // Exit if database connection fails
    }
}

async function startServer() {
    try {
        await initializeDatabase();

        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });

        server.on('error', (error: NodeJS.ErrnoException) => {
            if (error.syscall !== 'listen') {
                throw error;
            }

            switch (error.code) {
                case 'EACCES':
                    console.error(`Port ${PORT} requires elevated privileges`);
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    console.error(`Port ${PORT} is already in use`);
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();