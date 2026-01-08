import './App.css'
import { useState } from 'react';

interface Job {
    id: number,
    company: string,
    role: string
}

interface JobCardProps {
    job: Job;
    onDelete: (id: number) => void;
}

function JobCard({job, onDelete} : JobCardProps) {
    const [liked, setLiked] = useState(false);

    return (
        <div>
            <h2>{job.company} {liked ? '❤️' : ''}</h2>
            <p>Role: {job.role}</p>
            <button onClick={() => setLiked(!liked)}>{liked ? 'Unlike' : 'Like'}</button>

            <button onClick={() => onDelete(job.id)}>Delete</button>
        </div>
    )
}

function App() {
    const [jobs, setJobs] = useState<Job[]>([
        { id: 1, company: "Google", role: "Frontend" },
        { id: 2, company: "Meta", role: "Backend" }
    ]);

    const [companyName, setCompanyName] = useState("");

    const addJob = () => {
        if (companyName.trim() === "") return;

        const newJob: Job = {
            id: Date.now(),
            company: companyName,
            role: "Applicant"
        }

        setJobs([...jobs, newJob]);
        setCompanyName("");
    }

    const deleteJob = (id: number) => {
        setJobs(jobs.filter(job => job.id !== id));
    }

    return (
        <div>
            <h1>My Career Hub</h1>

            <input 
                type="text" 
                placeholder="Company Name" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
            />
            <button onClick={addJob}>Add Job</button>
            
            {jobs.map(job => 
                < JobCard 
                    key={job.id} 
                    job={job}
                    onDelete={deleteJob}/>
            )}
        </div>
    );
}

export default App