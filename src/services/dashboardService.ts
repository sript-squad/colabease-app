import { DashboardStats, DashboardProject } from '../types/Dashboard.types';
import { Project } from '../types/Project.types';
import { Task } from '../types/Task.types';
import { apiClient } from './apiClient';

/**
 * Fetch aggregated dashboard statistics by combining
 * data from the projects and tasks endpoints.
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const [projectsRes, allTasksRes] = await Promise.all([
    apiClient.get<Project[]>('/projects'),
    apiClient.get<Task[]>('/tasks', { params: { limit: 1000 } }),
  ]);

  const projects = projectsRes.data;

  // Active = planning or in_progress
  const activeProjects = projects.filter(
    (p) => p.status === 'planning' || p.status === 'in_progress',
  ).length;

  // Unique team members across all projects
  const memberSet = new Set<string>();
  projects.forEach((p) => {
    if (p.members) {
      p.members.forEach((m) => memberSet.add(m));
    }
    // Also count owners as team members
    if (p.ownerId) memberSet.add(p.ownerId);
  });

  // Also count unique assignees from tasks
  allTasksRes.data.forEach((t) => {
    if (t.assigneeId) memberSet.add(t.assigneeId);
    if (t.reporterId) memberSet.add(t.reporterId);
  });

  return {
    activeProjects,
    teamMembers: memberSet.size,
  };
};

/**
 * Fetch recent projects with computed progress
 * (based on task completion ratio per project).
 */
export const getRecentProjects = async (
  limit: number = 4,
): Promise<DashboardProject[]> => {
  const [projectsRes, tasksRes] = await Promise.all([
    apiClient.get<Project[]>('/projects'),
    apiClient.get<Task[]>('/tasks', { params: { limit: 1000 } }),
  ]);

  const projects = projectsRes.data;
  const tasks = tasksRes.data;

  // Build task-count map per project
  const taskCountMap = new Map<string, { total: number; done: number }>();
  tasks.forEach((task) => {
    const entry = taskCountMap.get(task.projectId) || { total: 0, done: 0 };
    entry.total += 1;
    if (task.status === 'DONE') entry.done += 1;
    taskCountMap.set(task.projectId, entry);
  });

  // Map status values to display-friendly labels
  const statusLabels: Record<string, string> = {
    planning: 'Planning',
    in_progress: 'In Progress',
    on_hold: 'On Hold',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  // Sort by createdAt descending, take top N
  const sorted = [...projects]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, limit);

  return sorted.map((project) => {
    const counts = taskCountMap.get(project._id) || { total: 0, done: 0 };
    const progress =
      counts.total > 0 ? Math.round((counts.done / counts.total) * 100) : 0;

    return {
      _id: project._id,
      name: project.name,
      status: statusLabels[project.status] || project.status,
      memberCount: (project.members?.length || 0) + 1, // +1 for owner
      progress,
    };
  });
};
