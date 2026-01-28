// Interfaces describe the shape of objects
// They help catch bugs and give autocomplete help
export type JobStatus = "Applied" | "Interviewing" | "Rejected" | "Offered";

export interface Job {
  id: string;
  company: string;
  role: string;
  status: JobStatus;
  date: string;
  liked: boolean;
  aiPrep?: string;
}

// Child component, receives read-only data (props) from the parent (App)
// Props that the JobCard component expects to receive
export interface JobCardProps {
  job: Job;                    // a single job object
  onDelete: (id: string) => void; // function that deletes a job by id
  onUpdateStatus: (id: string, status: JobStatus) => void;
  onLike: (id: string) => void;
  onGenerateAI: (id: string, role: string, company: string) => void;
}