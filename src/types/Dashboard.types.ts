export interface DashboardStats {
  activeProjects: number;
  completedTasks: number;
  teamMembers: number;
  hoursTracked: number | null; // null = not available from backend
}

export interface DashboardProject {
  _id: string;
  name: string;
  status: string;
  memberCount: number;
  progress: number; // derived from task completion ratio (0–100)
}
