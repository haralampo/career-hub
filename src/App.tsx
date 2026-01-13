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

interface Job {
    id: number,        // unique identifier
    company: string,   // company name
    role: string,      // job title
    status: string,    // Applied, Interviewing, Rejected
    date: string,      // date applied
    liked: boolean     // Liked or Unliked
}

// Props that the JobCard component expects to receive
interface JobCardProps {
    job: Job;                    // a single job object
    onDelete: (id: number) => void; // function that deletes a job by id
    onUpdateStatus: (id: number, status: string) => void;
    onLike: (id: number) => void;
}

/*
=====================
 JobCard Component
=====================
This is a CHILD component.
It receives read-only data (props) from the parent (App).
*/

// onDelete == deleteJob() function in App()
// onUpdateState == updateStatus() function in App()
function JobCard({ job, onDelete, onUpdateStatus, onLike }: JobCardProps) {

    // Returns UI for individual job card
    return (
        <div className={`job-card ${job.status.toLowerCase()}`}>
            <h2>{job.company} {job.liked ? '❤️' : ''}</h2>
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
            
            <button className="btn-like" onClick={() => onLike(job.id)}>
                {job.liked ? 'Unlike' : 'Like'}
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
    // Initialize `jobs` array
    const [jobs, setJobs] = useState<Job[]>(() => {
        const savedJobs = localStorage.getItem('my-jobs');
        return savedJobs ? JSON.parse(savedJobs) : [];
    });

    // Runs whenever `jobs` changes
    useEffect(() => {
        localStorage.setItem('my-jobs', JSON.stringify(jobs));
    }, [jobs]); // dependency array

    // States
    const [companyName, setCompanyName] = useState("");
    const [roleTitle, setRoleTitle] = useState("");
    const [searchText, setSearchText] = useState("");
    const [statusChoice, setStatusChoice] = useState("Applied");
    const [filterStatus, setFilterStatus] = useState("All");
    const [likedStatus, setLikedStatus] = useState(false);

    // Adds new job to `jobs`
    const addJob = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (companyName.trim() === "" || roleTitle.trim() === "") return;

        const date = new Date();
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0'); // January is 0
        const yyyy = date.getFullYear();
        const today = mm + '/' + dd + '/' + yyyy;

        // Create a new Job object
        const newJob: Job = {
            id: Date.now(),      // simple unique ID
            company: companyName,
            role: roleTitle,
            status: statusChoice,
            date: today,
            liked: false
        }

        // Update `jobs` state (NEVER mutate directly)
        setJobs([newJob, ...jobs]);

        setCompanyName("");
        setRoleTitle("");
        setLikedStatus(false);
    }

    // Deletes specific job from `jobs`
    const deleteJob = (id: number) => {
        setJobs(jobs.filter(job => job.id !== id));
    }

    // Updates application status of specific job in `jobs`
    const updateStatus = (id: number, newStatus: string) => {
        setJobs(jobs.map(job => job.id === id ? { ...job, status: newStatus } : job));
    }

    // Updates liked status of specific job in `jobs`
    const updateLikedStatus = (id: number) => {
        setJobs(jobs.map(job => job.id === id ? { ...job, liked: !job.liked} : job));
    }

    // Displays jobs based on search and filter parameters
    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.company.toLowerCase().includes(searchText.toLowerCase()) || 
                            job.role.toLowerCase().includes(searchText.toLowerCase());
        const matchesStatus = filterStatus === "All" || job.status === filterStatus;
        const matchesLiked = !likedStatus || job.liked;

        return matchesSearch && matchesStatus && matchesLiked;
    });

    const totalJobs = jobs.length;
    const interviewingCount = jobs.filter(job => job.status.toLowerCase() === "interviewing").length;
    const offeredCount = jobs.filter(job => job.status.toLowerCase() === "offered").length;
    const rejectedCount = jobs.filter(job => job.status.toLowerCase() === "rejected").length;

    // Returns UI for entire App()
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
                
                <div className='right-nav'>
                    <input 
                        type="text" 
                        placeholder="Search jobs..." 
                        className='search-bar'
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <select className='select-status' value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="All">All</option>
                        <option value="Applied">Applied</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Offered">Offered</option>
                    </select>
                    <div className="filter-group">
                        <input 
                            type="checkbox" 
                            id="liked-filter" 
                            checked={likedStatus} 
                            onChange={(e) => setLikedStatus(e.target.checked)}
                        />
                        <label htmlFor="liked-filter">Liked</label>
                    </div>
                </div>
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
                        onLike={updateLikedStatus}
                    />)
                }
            </div>
        </div>
    );
}

// Export App so it can be used by React
export default App;