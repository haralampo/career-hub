import './App.css'

// Import React hooks:
// useState = lets a component store and update data (state)
// useEffect = runs code after initial component render/changes (side effects)
import { useState, useEffect } from 'react';

/*
=====================
 TypeScript Interfaces
=====================
Interfaces describe the SHAPE of objects.
They help catch bugs and give autocomplete help.
*/

// A Job object must have these properties
interface Job {
    id: number,        // unique identifier
    company: string,   // company name
    role: string       // job title
}

// Props that the JobCard component expects to receive
interface JobCardProps {
    job: Job;                    // a single job object
    onDelete: (id: number) => void; // function that deletes a job by id
}

/*
=====================
 JobCard Component
=====================
This is a CHILD component.
It receives data (props) from the parent (App).
*/
function JobCard({ job, onDelete }: JobCardProps) {
    const [liked, setLiked] = useState(false);

    return (
        <div className='job-card'>
            <h2>{job.company} {liked ? '❤️' : ''}</h2>
            <p>Role: {job.role}</p>
            
            <button onClick={() => setLiked(!liked)}>
                {liked ? 'Unlike' : 'Like'}
            </button>

            {/* Call the delete function passed from the parent */}
            <button onClick={() => onDelete(job.id)}>
                Delete
            </button>
        </div>
    )
}

/*
=====================
 App Component (Parent)
=====================
This holds the main application state.
*/
function App() {
    const [jobs, setJobs] = useState<Job[]>(() => {
        const savedJobs = localStorage.getItem('my-jobs');
        return savedJobs ? JSON.parse(savedJobs) : [];
    });

    /*
    useEffect:
    - Runs whenever `jobs` changes
    - Saves the jobs array to localStorage
    */
    useEffect(() => {
        localStorage.setItem('my-jobs', JSON.stringify(jobs));
    }, [jobs]); // dependency array

    // Controlled input state for company name
    const [companyName, setCompanyName] = useState("");

    // Controlled input state for role title
    const [roleTitle, setRoleTitle] = useState("");

    /*
    Adds a new job to the list
    */
    const addJob = () => {
        if (companyName.trim() === "" || roleTitle.trim() === "") return;

        // Create a new Job object
        const newJob: Job = {
            id: Date.now(),      // simple unique ID
            company: companyName,
            role: roleTitle
        }

        // Update jobs state (NEVER mutate directly)
        setJobs([...jobs, newJob]);

        setCompanyName("");
        setRoleTitle("");
    }

    /*
    Deletes a job by filtering it out
    */
    const deleteJob = (id: number) => {
        setJobs(jobs.filter(job => job.id !== id));
    }

    return (
        <div>
            <h1>My Career Hub</h1>

            {/* Company Name Input */}
            <input 
                type="text" 
                placeholder="Company Name" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
            />

            {/* Role Title Input */}
            <input 
                type="text" 
                placeholder="Role Title" 
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
            />
            <button onClick={addJob}>Add Job</button>
            
            <div className='jobs-container'>
                {/*Renders a JobCard for each job*/}
                {jobs.map(job => 
                    <JobCard 
                        key={job.id}     // Required by React for lists
                        job={job}        // Pass job data
                        onDelete={deleteJob} // Pass delete function
                    />
                )}
            </div>
        </div>
    );
}

// Export App so it can be used by React
export default App;