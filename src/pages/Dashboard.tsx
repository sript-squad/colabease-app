import {
  Grid,
  Paper,
  Typography,
  Box,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
  Skeleton,
  Alert,
  Chip,
} from "@mui/material";
import {
  Assignment,
  CheckCircle,
  People,
  HourglassEmpty,
} from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import NewProject from "../components/NewProject";
import { getDashboardStats, getRecentProjects } from "../services/dashboardService";
import { DashboardStats, DashboardProject } from "../types/Dashboard.types";

// ── Demo data (no backend endpoints available yet) ──────────────────
const recentActivity = [
  {
    user: "Sarah Johnson",
    avatar: "SJ",
    action: "completed task 'Design Homepage'",
    time: "5 min ago",
  },
  {
    user: "Mike Chen",
    avatar: "MC",
    action: "uploaded new files to 'Assets'",
    time: "12 min ago",
  },
  {
    user: "Emily Davis",
    avatar: "ED",
    action: "commented on 'Project Brief'",
    time: "23 min ago",
  },
  {
    user: "Alex Turner",
    avatar: "AT",
    action: "created new milestone 'Phase 2'",
    time: "1 hour ago",
  },
];

const aiSuggestions = [
  "Review pending tasks in 'Website Redesign' project",
  "Schedule team meeting for Mobile App milestone review",
  "3 documents need your approval in Marketing Campaign",
  "Update project timeline for Product Research",
];

// ── Stat Card Component ─────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: number | null;
  icon: React.ReactNode;
  loading: boolean;
}

const StatCard = ({ title, value, icon, loading }: StatCardProps) => (
  <Grid item xs={12} sm={6} md={3}>
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6">{title}</Typography>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {icon}
        {loading ? (
          <Skeleton variant="text" width={60} height={45} />
        ) : (
          <Typography variant="h4">{value ?? "—"}</Typography>
        )}
      </Box>
    </Paper>
  </Grid>
);

// ── Dashboard Component ─────────────────────────────────────────────
const Dashboard = () => {
  const [openNewProject, setOpenNewProject] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, projectsData] = await Promise.all([
        getDashboardStats(),
        getRecentProjects(4),
      ]);
      setStats(statsData);
      setProjects(projectsData);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError(
        "Unable to load dashboard data. Please check that the backend server is running.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleOpenNewProject = () => {
    setOpenNewProject(true);
  };

  const handleCloseNewProject = () => {
    setOpenNewProject(false);
  };

  const handleCreateProject = (sourceData: {
    name: string;
    description?: string;
    ownerId: string;
  }) => {
    console.log("Create project with data:", sourceData);
    console.log("This would POST to: /projects");
    alert("Project creation function designed for backend integration");
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4">Welcome back! 👋</Typography>
        <Button variant="contained" onClick={handleOpenNewProject}>
          + New Project
        </Button>
      </Box>
      <NewProject
        open={openNewProject}
        onClose={handleCloseNewProject}
        onCreate={handleCreateProject}
      />

      {/* Error banner */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={fetchDashboardData}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* ── Stat Cards ──────────────────────────────────────── */}
        <StatCard
          title="Active Projects"
          value={stats?.activeProjects ?? null}
          icon={<Assignment sx={{ mr: 1 }} />}
          loading={loading}
        />
        <StatCard
          title="Tasks Completed"
          value={stats?.completedTasks ?? null}
          icon={<CheckCircle sx={{ mr: 1 }} />}
          loading={loading}
        />
        <StatCard
          title="Team Members"
          value={stats?.teamMembers ?? null}
          icon={<People sx={{ mr: 1 }} />}
          loading={loading}
        />
        <StatCard
          title="Hours Tracked"
          value={stats?.hoursTracked ?? null}
          icon={<HourglassEmpty sx={{ mr: 1 }} />}
          loading={loading}
        />

        {/* ── Recent Projects (live data) ─────────────────────── */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Recent Projects</Typography>
            {loading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, i) => (
                <Box key={i} sx={{ my: 2 }}>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="rectangular" height={4} sx={{ my: 1 }} />
                  <Skeleton variant="text" width="30%" />
                </Box>
              ))
            ) : projects.length === 0 ? (
              <Typography sx={{ my: 2, color: "text.secondary" }}>
                No projects yet. Create your first project to get started!
              </Typography>
            ) : (
              projects.map((project) => (
                <Box key={project._id} sx={{ my: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography>{project.name}</Typography>
                    <Typography variant="caption">{project.status}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={project.progress}
                  />
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="caption">
                      {project.memberCount} members
                    </Typography>
                    <Typography variant="caption">
                      {project.progress}%
                    </Typography>
                  </Box>
                </Box>
              ))
            )}
          </Paper>
        </Grid>

        {/* ── AI Suggestions (demo data) ──────────────────────── */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, backgroundColor: "#e3f2fd" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h6">AI Suggestions</Typography>
              <Chip label="Demo" size="small" color="info" variant="outlined" />
            </Box>
            <List>
              {aiSuggestions.map((suggestion, index) => (
                <ListItem key={index}>
                  <ListItemText primary={suggestion} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* ── Recent Activity (demo data) ─────────────────────── */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h6">Recent Activity</Typography>
              <Chip label="Demo" size="small" color="info" variant="outlined" />
            </Box>
            <List>
              {recentActivity.map((activity) => (
                <ListItem key={activity.user}>
                  <ListItemAvatar>
                    <Avatar>{activity.avatar}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${activity.user} ${activity.action}`}
                    secondary={activity.time}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
