import { NextAuth } from 'next-auth';
import Providers from 'next-auth/providers';
import { Pool } from 'pg';
import { User } from '@/app/lib/definitions';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

const options = {
  providers: [
    Providers.Credentials({
      async authorize(credentials: { email: string; password: string }) {
        const { email, password } = credentials;

        // Hash the password before saving (use a secure hashing algorithm)
        // For demonstration purposes, the password is saved as plain text (NOT RECOMMENDED)
        // You should use a secure password hashing library like bcrypt
        const hashedPassword = password; // Replace this with your hashing logic

        const client = await pool.connect();

        try {
          const result = await client.query<User>(
            `INSERT INTO users (id, first_name, last_name, email, password) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            ['John', 'Doe', email, hashedPassword]
          );

          const newUser = result.rows[0];

          // Return the newly created user to create the session
          return Promise.resolve(newUser);
        } catch (error) {
          // Handle any database errors here
          console.error('Error creating user:', error);
          return null;
        } finally {
          client.release();
        }
      },
    }),
    // Add other authentication providers as needed (e.g., Google, GitHub, etc.)
    // ...
  ],
  // Other NextAuth options (e.g., callbacks, JWT configuration, etc.)
  // ...
};

export default NextAuth(options);
