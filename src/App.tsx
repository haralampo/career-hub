import './App.css'

// Import React hooks:
// useState = lets a component store and update data (state)
// useEffect = runs code after initial component render/changes (side effects)
import { useState, useEffect } from 'react';
import { getJobAdvice } from './openai';
import type { Job, JobStatus, JobCardProps } from "./types";


// Helper function
const formatDateDisplay = (dateString: string) => {
  if (!dateString) return "";
  // The 'options' object lets you customize exactly how the date looks
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Child component
// onDelete == deleteJob() function in App()
// onUpdateStatus == updateStatus() function in App()
function JobCard({ job, onDelete, onUpdateStatus, onLike, onGenerateAI }: JobCardProps) {
  // Data owned by and can be changed by component
  const [loading, setLoading] = useState(false);
  const [showAdvice, setShowAdvice] = useState(false);

  const handleAI = async () => {
    setLoading(true);
    await onGenerateAI(job.id, job.role, job.company);
    setLoading(false);
    setShowAdvice(true);
  };

  // Returns UI for individual job card
  return (
    <div className={`job-card ${job.status.toLowerCase()}`}>

      { /* Title, role, status */ }
      <h2>{job.company} {job.liked ? '❤️' : ''}</h2>
      <p>Role: {job.role}</p>
      <p>Status: {job.status}</p>

      { /* Select to modify status */ }
      <select value={job.status}
        onChange={(e) => onUpdateStatus(job.id, e.target.value as JobStatus)}
        >
        <option value="Applied">Applied</option>
        <option value="Interviewing">Interviewing</option>
        <option value="Rejected">Rejected</option>
        <option value="Offered">Offered</option>
      </select>

      { /* Date */ }
      <p className="job-date">{formatDateDisplay(job.date)}</p>

      { /* Like, delete, AI buttons */ }
      <button className="btn-like" onClick={() => onLike(job.id)}>
        {job.liked ? 'Unlike' : 'Like'}
      </button>
      <button className="btn-delete" onClick={() => onDelete(job.id)}>
        Delete
      </button>
      <button
        className="btn-ai"
        onClick={handleAI}
        disabled={loading}
        >
        {loading ? "Thinking..." : "✨ Get Prep"}
      </button>

      {job.aiPrep && (
        <>
          <button onClick={() => setShowAdvice(!showAdvice)} className="btn-toggle">
            {showAdvice ? "Hide Prep" : "Show Prep"}
          </button>

          {showAdvice && (
            <div className="ai-advice-box">
              {job.aiPrep}
            </div>
          )}
        </>
      )}
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
  const [statusChoice, setStatusChoice] = useState<JobStatus>("Applied");
  const [filterStatus, setFilterStatus] = useState("All");
  const [likedStatus, setLikedStatus] = useState(false);
  const [appliedDate, setAppliedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [showSuccess, setShowSuccess] = useState(false);

  // Adds new job to `jobs`
  const addJob = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (companyName.trim() === "" || roleTitle.trim() === "") return;

    const newJob: Job = {
      id: crypto.randomUUID(),
      company: companyName,
      role: roleTitle,
      status: statusChoice,
      date: appliedDate, // Use the selected date
      liked: false
    }

    setJobs([newJob, ...jobs]);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setAppliedDate(new Date().toISOString().split('T')[0]);

    // Reset fields
    setCompanyName("");
    setRoleTitle("");
  }

  // Deletes specific job from `jobs`
  const deleteJob = (id: string) => {
    setJobs(jobs.filter(job => job.id !== id));
  }

  // Updates application status of specific job in `jobs`
  const updateStatus = (id: string, newStatus: JobStatus) => {
    setJobs(jobs.map(job => job.id === id ? { ...job, status: newStatus } : job));
  }

  // Updates liked status of specific job in `jobs`
  const updateLikedStatus = (id: string) => {
    setJobs(jobs.map(job => job.id === id ? { ...job, liked: !job.liked } : job));
  }

  const resetDashboard = () => {
    if (window.confirm("Are you sure? This will delete all saved jobs forever.")) {
      setJobs([]);
      localStorage.removeItem('my-jobs');
    }
  };

  const generateAIPrep = async (id: string, role: string, company: string) => {
    const advice = await getJobAdvice(role, company);

    // Ensure advice is a string so TypeScript doesn't complain
    const safeAdvice = advice ? advice.trim() : "No advice available.";

    setJobs(prevJobs => prevJobs.map(job =>
      job.id === id ? { ...job, aiPrep: safeAdvice } : job
    ));
  };

  // Displays jobs based on search and filter parameters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.company.toLowerCase().includes(searchText.toLowerCase()) ||
      job.role.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = filterStatus === "All" || job.status === filterStatus;
    const matchesLiked = !likedStatus || job.liked;

    return matchesSearch && matchesStatus && matchesLiked;
  }).sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
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
        <input
          type="date"
          value={appliedDate}
          onChange={(e) => setAppliedDate(e.target.value)}
        />
        <select className='select-form' value={statusChoice}
          onChange={(e) => setStatusChoice(e.target.value as JobStatus)}>
          <option value="Applied">Applied</option>
          <option value="Interviewing">Interviewing</option>
          <option value="Rejected">Rejected</option>
          <option value="Offered">Offered</option>
        </select>
        <button className="btn-add">Add Job</button>
      </form>

      <div className='jobs-container'>
        {jobs.length === 0 ? (
          <div className="empty-state">🚀 No jobs tracked yet. Time to apply!</div>
        ) : filteredJobs.length === 0 ? (
          <div className="empty-state">🔍 No results found matching your search.</div>
        ) : (
          filteredJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onDelete={deleteJob}
              onUpdateStatus={updateStatus}
              onLike={updateLikedStatus}
              onGenerateAI={generateAIPrep}
            />
          ))
        )}
      </div>

      {showSuccess && (
        <div className="success-toast">
          ✅ Job added!
        </div>
      )}

      <footer>
        <button type="button" className="btn-reset" onClick={resetDashboard}>
          Reset Dashboard
        </button>
      </footer>
    </div>
  );
}

// Export App so it can be used by React
export default App;