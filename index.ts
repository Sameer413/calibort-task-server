import dotenv from "dotenv";
import express from "express";
import { dbClient } from "./config/db";
import { createUsersTable } from "./config/tableInit";
import router from "./routes/route";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config()

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

app.use(router);



app.listen(process.env.PORT || 5555, () => {
    console.log("Server is running");

    dbClient.connect()
        .then(() => console.log("Database connected successfully"))
        .catch((e: Error) => console.error(e.message));

    createUsersTable();
});