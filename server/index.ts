import express, { Request, Response } from 'express';
import cors from 'cors';
import { Job, JobStatus } from '../client/src/types';
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config(); // Loads the key from server/.env

const app = express();
const PORT = 5001; // Use 5001 to avoid conflict with Vite (3000/5173)

app.use(cors());
app.use(express.json());

// In-memory "Database"
let jobs: Job[] = [];

// POST: Add a new job (matches 'addJob' logic in App.tsx)
app.post('/api/jobs', (req: Request, res: Response) => {
  const newJob = { ...req.body, id: Date.now().toString() };
  jobs.push(newJob);
  res.status(201).json(newJob);
});

// GET: Fetch all jobs
app.get('/api/jobs', (req: Request, res: Response) => {
  res.json(jobs);
});

// PATCH: Update a specific job (Status or Liked status)
app.patch('/api/jobs/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body; // This contains { status: '...' } or { liked: true }

  const jobIndex = jobs.findIndex(j => j.id === id);

  if (jobIndex === -1) {
    return res.status(404).json({ error: "Job not found" });
  }

  // Merge existing data with updates
  jobs[jobIndex] = { ...jobs[jobIndex], ...updates };

  res.json(jobs[jobIndex]);
});

// DELETE: Remove a job (matches 'deleteJob' in App.tsx)
app.delete('/api/jobs/:id', (req: Request, res: Response) => {
  jobs = jobs.filter(j => j.id !== req.params.id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/prep', async (req, res) => {
  const { role, company } = req.body;
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
        [One sentence tip]`},
      { 
        role: "user", content: `Job: ${role} at ${company}` 
      }
    ]
  });
  res.json({ advice: completion.choices[0].message.content });
});