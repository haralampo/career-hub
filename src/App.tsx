import './App.css'
import { useState, useEffect } from 'react';

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
        <div className='job-card'>
            <h2>{job.company} {liked ? '❤️' : ''}</h2>
            <p>Role: {job.role}</p>
            <button onClick={() => setLiked(!liked)}>{liked ? 'Unlike' : 'Like'}</button>
            <button onClick={() => onDelete(job.id)}>Delete</button>
        </div>
    )
}

function App() {
    const [jobs, setJobs] = useState<Job[]>(() => {
        const savedJobs = localStorage.getItem('my-jobs');
        return savedJobs ? JSON.parse(savedJobs) : [];
    });

    useEffect(() => {
        localStorage.setItem('my-jobs', JSON.stringify(jobs));
    }, [jobs]);

    const [companyName, setCompanyName] = useState("");
    const [roleTitle, setRoleTitle] = useState("");

    const addJob = () => {
        if (companyName.trim() === "" || roleTitle.trim() === "") return;

        const newJob: Job = {
            id: Date.now(),
            company: companyName,
            role: roleTitle
        }

        setJobs([...jobs, newJob]);
        setCompanyName("");
        setRoleTitle("");
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
            <input 
                type="text" 
                placeholder="Role Title" 
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
            />
            <button onClick={addJob}>Add Job</button>
            
            <div className='jobs-container'>
                {jobs.map(job => 
                    < JobCard 
                        key={job.id} 
                        job={job}
                        onDelete={deleteJob}/>
                )}
            </div>
        </div>
    );
}

export default App