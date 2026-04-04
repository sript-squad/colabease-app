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
} from "@mui/material";
import {
  Assignment,
  CheckCircle,
  People,
  HourglassEmpty,
} from "@mui/icons-material";
import { useState } from "react";
import NewProject from "../components/NewProject";

const projects = [
  { name: "Website Redesign", status: "On Track", members: 5, progress: 75 },
  {
    name: "Mobile App Launch",
    status: "In Progress",
    members: 8,
    progress: 45,
  },
  {
    name: "Marketing Campaign",
    status: "Almost Done",
    members: 4,
    progress: 90,
  },
  { name: "Product Research", status: "Starting", members: 3, progress: 30 },
];

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

const Dashboard = () => {
  const [openNewProject, setOpenNewProject] = useState(false);

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
    // Function designed to match backend CreateProjectDto structure
    // POST /projects endpoint expects:
    // { name: string, description?: string, ownerId: string }
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
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Active Projects</Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Assignment sx={{ mr: 1 }} />
              <Typography variant="h4">12</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Tasks Completed</Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <CheckCircle sx={{ mr: 1 }} />
              <Typography variant="h4">87</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Team Members</Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <People sx={{ mr: 1 }} />
              <Typography variant="h4">24</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Hours Tracked</Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <HourglassEmpty sx={{ mr: 1 }} />
              <Typography variant="h4">156</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Recent Projects</Typography>
            {projects.map((project) => (
              <Box key={project.name} sx={{ my: 2 }}>
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
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption">
                    {project.members} members
                  </Typography>
                  <Typography variant="caption">{project.progress}%</Typography>
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, backgroundColor: "#e3f2fd" }}>
            <Typography variant="h6">AI Suggestions</Typography>
            <List>
              {aiSuggestions.map((suggestion, index) => (
                <ListItem key={index}>
                  <ListItemText primary={suggestion} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Recent Activity</Typography>
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
