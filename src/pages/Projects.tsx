import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Avatar,
  AvatarGroup,
  Chip,
} from "@mui/material";
import { FilterList } from "@mui/icons-material";
import NewProject from "../components/NewProject";

const projects = [
  {
    name: "Website Redesign",
    status: "In Progress",
    description:
      "A complete overhaul of the company website with a modern design and improved user experience.",
    progress: 60,
    dueDate: "2024-08-15",
    team: ["JD", "AS", "MC"],
  },
  {
    name: "Mobile App Development",
    status: "On Track",
    description:
      "Creating a new mobile application for both iOS and Android platforms.",
    progress: 80,
    dueDate: "2024-09-01",
    team: ["ED", "SJ"],
  },
  {
    name: "Marketing Campaign",
    status: "At Risk",
    description: "A new marketing campaign to promote the new mobile app.",
    progress: 30,
    dueDate: "2024-07-30",
    team: ["AT", "MC", "ED"],
  },
  {
    name: "API Integration",
    status: "Completed",
    description: "Integrating a third-party API for enhanced functionality.",
    progress: 100,
    dueDate: "2024-06-20",
    team: ["SJ", "JD"],
  },
];

const getStatusChipColor = (status) => {
  switch (status) {
    case "In Progress":
      return "primary";
    case "On Track":
      return "success";
    case "At Risk":
      return "warning";
    case "Completed":
      return "default";
    default:
      return "default";
  }
};

const Projects = () => {
  const [openNewProject, setOpenNewProject] = useState(false);

  const handleOpenNewProject = () => {
    setOpenNewProject(true);
  };

  const handleCloseNewProject = () => {
    setOpenNewProject(false);
  };

  const handleCreateProject = (projectData: {
    name: string;
    description?: string;
    ownerId: string;
  }) => {
    console.log("New project data:", projectData);
    handleCloseNewProject();
    // TODO: Integrate with backend API when ready
    // POST /projects with projectData
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
        <Typography variant="h4">Projects</Typography>
        <Box>
          <Button
            variant="contained"
            sx={{ mr: 2 }}
            onClick={handleOpenNewProject}
          >
            + Create Project
          </Button>
          <TextField size="small" placeholder="Search..." sx={{ mr: 2 }} />
          <Button variant="outlined" startIcon={<FilterList />}>
            Filter
          </Button>
        </Box>
      </Box>
      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project.name}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6">{project.name}</Typography>
                  <Chip
                    label={project.status}
                    color={getStatusChipColor(project.status)}
                    size="small"
                  />
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ my: 2 }}
                >
                  {project.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption">Progress</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={project.progress}
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <AvatarGroup max={4}>
                    {project.team.map((member) => (
                      <Avatar key={member}>{member}</Avatar>
                    ))}
                  </AvatarGroup>
                  <Typography variant="caption">
                    Due: {project.dueDate}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <NewProject
        open={openNewProject}
        onClose={handleCloseNewProject}
        onCreate={handleCreateProject}
      />
    </Box>
  );
};

export default Projects;
