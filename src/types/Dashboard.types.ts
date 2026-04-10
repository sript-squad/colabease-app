export interface DashboardStats {
  activeProjects: number;
  teamMembers: number;
}

export interface DashboardProject {
  _id: string;
  name: string;
  status: string;
  memberCount: number;
  progress: number; // derived from task completion ratio (0–100)
}
