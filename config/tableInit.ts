import { dbClient } from "./db";

export const createUsersTable = async () => {
  try {
    // Enable the uuid extension (run once)
    await dbClient.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // Create users table if not exists
    await dbClient.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          file_name TEXT ,
          image_url TEXT ,
          password TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT now()
        );
      `);

    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS third_users (
      id INTEGER PRIMARY KEY,
      email VARCHAR(100),
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      avatar TEXT
    );`)

    console.log('users table created or already exists');
  } catch (err: any) {
    console.error('Failed to create table:', err.message);
    throw err;
  }
};
