// server/prisma.config.ts
import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';

// Manually trigger dotenv so the config can read your .env file
dotenv.config();

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});