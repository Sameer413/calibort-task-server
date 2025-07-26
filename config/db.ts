import { Client } from "pg";

export const dbClient = new Client({
    connectionString: "postgresql://postgres:srnimje844@db.pvgntkcsunchrcgfpind.supabase.co:5432/postgres",
    ssl: { rejectUnauthorized: false }
});