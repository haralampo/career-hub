import express, { Request, Response } from 'express';
import cors from 'cors';
import OpenAI from "openai";
import dotenv from "dotenv";
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const PORT = 5001;
const prisma = new PrismaClient(); // Initialize Prisma
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

// --- AI PREP ROUTE ---
app.post('/api/prep', async (req, res) => {
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

    res.json({ advice });
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ error: "AI failed" });
  }
});

// --- DATABASE ROUTES ---

// GET: Fetch all jobs from Neon
app.get('/api/jobs', async (req: Request, res: Response) => {
  try {
    const jobs = await prisma.job.findMany({ 
      orderBy: { createdAt: 'desc' } 
    });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// POST: Add a new job to Neon
app.post('/api/jobs', async (req: Request, res: Response) => {
  try {
    const { company, role, status, date } = req.body;
    const newJob = await prisma.job.create({ 
      data: { company, role, status, date } 
    });
    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).json({ error: "Failed to create job" });
  }
});

// PATCH: Update a specific job
app.patch('/api/jobs/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string; // Explicitly cast as string
    const updatedJob = await prisma.job.update({ 
      where: { id: id }, // This now satisfies JobWhereUniqueInput
      data: req.body 
    });
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

// DELETE: Remove a job
app.delete('/api/jobs/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string; // Explicitly cast as string
    await prisma.job.delete({ 
      where: { id: id } 
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});