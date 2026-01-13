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
    role: string,      // job title
    status: string,    // Applied, Interviewing, Rejected
    date: string       // date applied
}

// Props that the JobCard component expects to receive
interface JobCardProps {
    job: Job;                    // a single job object
    onDelete: (id: number) => void; // function that deletes a job by id
    onUpdateStatus: (id: number, status: string) => void;
}

/*
=====================
 JobCard Component
=====================
This is a CHILD component.
It receives data (props) from the parent (App).
*/
function JobCard({ job, onDelete, onUpdateStatus }: JobCardProps) {
    const [liked, setLiked] = useState(false);

    return (
        <div className={`job-card ${job.status.toLowerCase()}`}>
            <h2>{job.company} {liked ? '❤️' : ''}</h2>
            <p>Role: {job.role}</p>
            <p>Status: {job.status}</p>
            <select 
                    value={job.status} 
                    onChange={(e) => onUpdateStatus(job.id, e.target.value)}
                >
                <option value="Applied">Applied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Rejected">Rejected</option>
                <option value="Offered">Offered</option>
            </select>
            <p>{job.date}</p>
            
            <button className="btn-like" onClick={() => setLiked(!liked)}>
                {liked ? 'Unlike' : 'Like'}
            </button>

            <button className="btn-delete" onClick={() => onDelete(job.id)}>
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

    const [companyName, setCompanyName] = useState("");
    const [roleTitle, setRoleTitle] = useState("");
    const [searchText, setSearchText] = useState("");
    const [statusChoice, setStatusChoice] = useState("Applied");

    /*
    Adds a new job to the list
    */
    const addJob = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (companyName.trim() === "" || roleTitle.trim() === "") return;

        // Source - https://stackoverflow.com/a
        // Posted by Samuel Meddows, modified by community. See post 'Timeline' for change history
        // Retrieved 2026-01-12, License - CC BY-SA 4.0

        const date = new Date();
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
        const yyyy = date.getFullYear();

        const today = mm + '/' + dd + '/' + yyyy;

        // Create a new Job object
        const newJob: Job = {
            id: Date.now(),      // simple unique ID
            company: companyName,
            role: roleTitle,
            status: statusChoice,
            date: today
        }

        // Update jobs state (NEVER mutate directly)
        setJobs([newJob, ...jobs]);

        setCompanyName("");
        setRoleTitle("");
    }

    /*
    Deletes a job by filtering it out
    */
    const deleteJob = (id: number) => {
        setJobs(jobs.filter(job => job.id !== id));
    }

    const updateStatus = (id: number, newStatus: string) => {
        setJobs(jobs.map(job => job.id === id ? { ...job, status: newStatus } : job));
    }

    const filteredJobs = jobs.filter(job => job.company.toLowerCase().includes(searchText.toLowerCase()) || job.role.toLowerCase().includes(searchText.toLowerCase()));

    const totalJobs = jobs.length;
    const interviewingCount = jobs.filter(job => job.status.toLowerCase() === "interviewing").length;
    const offeredCount = jobs.filter(job => job.status.toLowerCase() === "offered").length;
    const rejectedCount = jobs.filter(job => job.status.toLowerCase() === "rejected").length;

    return (
        <div>
            <div className="top-nav">
                <header className="dashboard">
                    <span>📊 Dashboard:</span>
                    <span className='stat-pill'>{totalJobs} Total</span>
                    <span className='stat-pill'>{interviewingCount} Interviewing</span>
                    <span className='stat-pill'>{offeredCount} Offered</span>
                    <span className='stat-pill'>{rejectedCount} Rejected</span>
                </header>
                
                <input 
                    type="text" 
                    placeholder="Search jobs..." 
                    className='search-bar'
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>

            <h1>My Career Hub</h1>


            <form onSubmit={addJob}>
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
                <select className='select-form' value={statusChoice} 
                        onChange={(e) => setStatusChoice(e.target.value)}>
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Offered">Offered</option>
                </select>
                <button className="btn-add">Add Job</button>
            </form>
            
            <div className='jobs-container'>
                {/*Renders a JobCard for each job*/}
                {filteredJobs.length === 0 ? "No results found" : filteredJobs.map(job => 
                    <JobCard 
                        key={job.id}     // Required by React for lists
                        job={job}        // Pass job data
                        onDelete={deleteJob} // Pass delete function
                        onUpdateStatus={updateStatus}
                    />)
                }
            </div>
        </div>
    );
}

// Export App so it can be used by React
export default App;