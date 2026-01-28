import express, { Request, Response } from 'express';
import cors from 'cors';
import { Job } from '../client/src/types';

const app = express();
const PORT = 5001; // Use 5001 to avoid conflict with Vite (3000/5173)

app.use(cors());
app.use(express.json());

// In-memory "Database"
let jobs: Job[] = []; 

// GET: Fetch all jobs
app.get('/api/jobs', (req: Request, res: Response) => {
  res.json(jobs);
});

// POST: Add a new job (matches 'addJob' logic in App.tsx)
app.post('/api/jobs', (req: Request, res: Response) => {
  const newJob = { ...req.body, id: Date.now().toString() };
  jobs.push(newJob);
  res.status(201).json(newJob);
});

// DELETE: Remove a job (matches 'deleteJob' in App.tsx)
app.delete('/api/jobs/:id', (req: Request, res: Response) => {
  jobs = jobs.filter(j => j.id !== req.params.id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});