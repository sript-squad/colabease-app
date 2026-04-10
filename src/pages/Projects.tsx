import React, { useState, useEffect } from "react";
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
  CircularProgress,
} from "@mui/material";
import { FilterList } from "@mui/icons-material";
import NewProject from "../components/NewProject";
import { projectService } from "../services/projectService";
import { useNavigate } from "react-router-dom";

const getStatusChipColor = (status: string) => {
  switch (status) {
    case "planning":
      return "default";
    case "active":
      return "primary";
    case "on-hold":
      return "warning";
    case "completed":
      return "success";
    default:
      return "default";
  }
};

const Projects = () => {
  const [openNewProject, setOpenNewProject] = useState(false);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectService.getAll();
      setProjectsList(res.data);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenNewProject = () => {
    setOpenNewProject(true);
  };

  const handleCloseNewProject = () => {
    setOpenNewProject(false);
  };

  const handleCreateProject = () => {
    handleCloseNewProject();
    fetchProjects();
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
        <Typography variant="h4" fontWeight="800" color="#1a2e0f">Projects</Typography>
        <Box>
          <Button
            variant="contained"
            sx={{ mr: 2, background: '#3B6D11', '&:hover': { background: '#2d540d' } }}
            onClick={handleOpenNewProject}
          >
            + Create Project
          </Button>
          <TextField size="small" placeholder="Search..." sx={{ mr: 2 }} />
          <Button variant="outlined" startIcon={<FilterList />} sx={{ color: '#3B6D11', borderColor: '#3B6D11' }}>
            Filter
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
          <CircularProgress sx={{ color: '#3B6D11' }} />
        </Box>
      ) : projectsList.length === 0 ? (
        <Box sx={{ textAlign: 'center', p: 10, bgcolor: '#f8faf5', borderRadius: '16px', border: '2px dashed #eaf3de' }}>
          <Typography variant="h6" color="#7a9e7a">No projects found. Create one to get started!</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {projectsList.map((project) => (
            <Grid key={project._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card 
                sx={{ 
                  cursor: 'pointer', 
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }
                }}
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography variant="h6" fontWeight="700" color="#1a2e0f">{project.name}</Typography>
                    <Chip
                      label={project.status}
                      color={getStatusChipColor(project.status) as any}
                      size="small"
                      sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    color="#7a9e7a"
                    sx={{ my: 2, height: '40px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                  >
                    {project.description || "No description provided."}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                       <Typography variant="caption" fontWeight="bold" color="#3B6D11">Progress</Typography>
                       <Typography variant="caption" fontWeight="bold">0%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={0}
                      sx={{ height: 6, borderRadius: 3, bgcolor: '#eaf3de', '& .MuiLinearProgress-bar': { bgcolor: '#3B6D11' } }}
                    />
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '12px' } }}>
                      {project.members?.map((member: string) => (
                        <Avatar key={member} sx={{ bgcolor: '#C0DD97' }}>{member.substring(0, 2).toUpperCase()}</Avatar>
                      ))}
                      <Avatar sx={{ bgcolor: '#3B6D11' }}>{project.ownerId?.substring(0, 2).toUpperCase()}</Avatar>
                    </AvatarGroup>
                    <Typography variant="caption" color="text.secondary">
                      {project.endDate ? `Due: ${new Date(project.endDate).toLocaleDateString()}` : "No due date"}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <NewProject
        open={openNewProject}
        onClose={handleCloseNewProject}
        onCreate={handleCreateProject}
      />
    </Box>
  );
};

export default Projects;
