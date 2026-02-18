import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { clerkMiddleware, requireAuth, getAuth } from '@clerk/express';
import cors from 'cors';
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const app = express(); // Handles HTTP routes
const PORT = 5001;
const prisma = new PrismaClient(); // Serves as translator between TS code + Postgres database
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

// --- AI PREP ROUTE ---
app.post('/api/prep', async (req: Request, res: Response) => {
  try {
    const { role, company, id } = req.body; 

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system", 
          content: `IMPORTANT: Do not use any leading spaces, tabs, or indentation. 
          Start every line exactly at the left margin. 
          You are an expert recruiter. Format your response exactly like this:
            
          QUESTIONS:
          1. [Question 1]
          2. [Question 2]
          3. [Question 3]
          
          PRO-TIP:
          [One sentence tip]`
        },
        { role: "user", content: `Job: ${role} at ${company}` }
      ]
    });

    const advice = completion.choices[0].message.content;

    // Save advice to DB so it persists on refresh
    if (id) {
      await prisma.job.update({
        where: { id: id },
        data: { aiPrep: advice }
      });
    }
    // Send data to client as JSON, end request
    res.json({ advice });
  } 
  catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ error: "AI failed" });
  }
});

// --- DATABASE ROUTES ---

// GET: Fetch all jobs from Neon
app.get('/api/jobs', requireAuth(), async (req: Request, res: Response) => {
  const { userId } = getAuth(req);

  try {
    const jobs = await prisma.job.findMany({ 
      where: { userId: userId as string },
      orderBy: { createdAt: 'desc' } 
    });
    res.json(jobs);
  } 
  catch (error) {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// POST: Add a new job to Neon
app.post('/api/jobs', requireAuth(), async (req: Request, res: Response) => {
  // Get identity from request
  const auth = getAuth(req);
  const userId = auth.userId;

  if (!userId) {
    return res.status(401).json({ error: "No user ID found in token" });
  }
  console.log("Verified User ID:", userId);

  const { company, role, status, date } = req.body;
  if (!company || !role) {
    return res.status(400).json({ error: "Company and Role are required" });
  }

  try {
    // Save to Prisma with userId
    const newJob = await prisma.job.create({
      data: {
        company,
        role,
        status,
        date,
        userId: userId
      },
    });

    res.json(newJob);
  } 
  catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save job" });
  }
});

// PATCH: Update a specific job
app.patch('/api/jobs/:id', requireAuth(), async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const id = req.params.id as string;

  try {
    const updatedJob = await prisma.job.update({ 
      where: { 
        id: id,
        userId: userId as string 
      },
      data: req.body 
    });
    res.json(updatedJob);
  } 
  catch (error) {
    res.status(500).json({ error: "Update failed or unauthorized" });
  }
});

// DELETE: Remove a job
app.delete('/api/jobs/:id', requireAuth(), async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const id = req.params.id as string;

  try {
    await prisma.job.delete({ 
      where: { 
        id: id,
        userId: userId as string 
      } 
    });
    res.status(204).send();
  } 
  catch (error) {
    res.status(500).json({ error: "Delete failed or unauthorized" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});