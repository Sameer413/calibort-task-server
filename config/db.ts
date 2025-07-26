require("dotenv").config();
import { Client } from "pg";

export const dbClient = new Client({
    connectionString: process.env.DB_URL,
    ssl: { rejectUnauthorized: false }
});