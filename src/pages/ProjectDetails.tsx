import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, Paper, 
  CircularProgress, Avatar, AvatarGroup, IconButton,
  Card, CardContent, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Add, ArrowBack, PersonAdd } from '@mui/icons-material';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { authService } from '../services/authService';
import { Project } from '../types/Project.types';
import { Task, TaskStatus, TaskPriority } from '../types/Task.types';
import { useAuth } from '../auth/authContex';

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwner = project?.ownerId === user?.email;

  // Task Modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<{title: string, description: string, priority: TaskPriority, assigneeId: string}>({ title: '', description: '', priority: 'MEDIUM', assigneeId: '' });
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

  // Member Modal state
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [newMember, setNewMember] = useState('');

  const fetchProjectData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [projectRes, tasksRes] = await Promise.all([
        projectService.getOne(id),
        taskService.getAll(id)
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (e: any) {
      console.error(e);
      if (e.response?.status === 403 || e.response?.status === 401) {
        alert('You do not have access to this project.');
        navigate('/projects');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const handleCreateTask = async () => {
    if (!id || !newTask.title.trim()) return;
    try {
      await taskService.create({
        title: newTask.title,
        description: newTask.description,
        projectId: id,
        priority: newTask.priority,
        status: 'OPEN',
        assigneeId: newTask.assigneeId || undefined,
        reporterId: 'current-user-id' // Ideally from Auth context
      });
      setIsTaskModalOpen(false);
      setNewTask({ title: '', description: '', priority: 'MEDIUM', assigneeId: '' });
      fetchProjectData();
    } catch (e) {
      console.error('Failed to create task', e);
    }
  };

  const handleAddMember = async () => {
    if (!id || !project || !newMember.trim()) return;
    
    // Validate email format basic check
    if (!newMember.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      const response = await authService.checkUser(newMember.trim());
      if (!response.data.exists) {
        alert('User not found. Only registered users can be added as members.');
        return;
      }

      const updatedMembers = [...(project.members || []), newMember.trim()];
      await projectService.update(id, { members: updatedMembers });
      setIsMemberModalOpen(false);
      setNewMember('');
      fetchProjectData();
    } catch (e) {
      console.error('Failed to add member', e);
      alert('Failed to verify user. Please try again later.');
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;
    
    // Optimistic UI update
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    
    try {
      await taskService.update(taskId, { status: newStatus });
      fetchProjectData();
    } catch (err) {
      console.error('Failed to update status', err);
      fetchProjectData(); // Revert on failure
    }
  };

  const handleUpdateViewingTask = async (updates: Partial<Task>) => {
    if (!viewingTask) return;
    setViewingTask({ ...viewingTask, ...updates });
    try {
      await taskService.update(viewingTask._id, updates);
      fetchProjectData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async () => {
    if (!viewingTask) return;
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskService.delete(viewingTask._id);
      setViewingTask(null);
      fetchProjectData();
    } catch (e) {
      console.error('Failed to delete task', e);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!project) {
    return <Typography sx={{ p: 4, color: 'error.main' }}>Project not found.</Typography>;
  }

  const columns = [
    { title: 'TO DO', value: 'OPEN' as TaskStatus, color: '#e0e0e0' },
    { title: 'IN PROGRESS', value: 'IN_PROGRESS' as TaskStatus, color: '#bbdefb' },
    { title: 'DONE', value: 'DONE' as TaskStatus, color: '#c8e6c9' }
  ];

  return (
    <Box sx={{ p: 0, fontFamily: 'Outfit, sans-serif' }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        borderBottom: '1px solid #EAF3DE', mb: 3, pb: 2,
        background: 'linear-gradient(to right, #FFFFFF, #FDFDFD)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={() => navigate('/projects')}
            sx={{ color: '#3B6D11', '&:hover': { background: '#EAF3DE' } }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight="800" color="#1a2e0f" sx={{ tracking: '-0.5px' }}>
              {project.name}
            </Typography>
            <Typography variant="body2" color="#7a9e7a" fontWeight="500">
              {project.description || 'No description provided.'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <AvatarGroup max={4} sx={{ 
            '& .MuiAvatar-root': { width: 36, height: 36, fontSize: '14px', border: '2px solid #fff' } 
          }}>
            {project.members?.map(m => (
              <Avatar key={m} sx={{ bgcolor: '#C0DD97', color: '#1a2e0f' }}>
                {m.substring(0, 2).toUpperCase()}
              </Avatar>
            ))}
          </AvatarGroup>
          {isOwner && (
            <Button 
              variant="contained" 
              size="medium" 
              startIcon={<PersonAdd />}
              sx={{ 
                textTransform: 'none', 
                background: '#3B6D11', 
                color: '#fff',
                boxShadow: '0 4px 12px rgba(59, 109, 17, 0.2)',
                borderRadius: '10px',
                px: 3,
                '&:hover': { background: '#2d540d', boxShadow: '0 6px 16px rgba(59, 109, 17, 0.3)' } 
              }}
              onClick={() => setIsMemberModalOpen(true)}
            >
              Add Member
            </Button>
          )}
        </Box>
      </Box>

      {/* Board */}
      <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', pb: 4, minHeight: '65vh' }}>
        {columns.map(col => (
          <Paper 
            key={col.value} 
            sx={{ 
              flex: '0 0 320px', 
              bgcolor: '#F8FAF5', 
              p: 2.5, 
              borderRadius: '16px',
              border: '1px solid #EAF3DE',
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
              transition: 'all 0.3s ease',
              '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }
            }}
            elevation={0}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col.value)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight="800" color="#3B6D11" sx={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                {col.title}
              </Typography>
              <Chip 
                label={tasks.filter(t => t.status === col.value).length} 
                size="small" 
                sx={{ bgcolor: '#EAF3DE', color: '#3B6D11', fontWeight: 'bold', height: '20px' }} 
              />
            </Box>
            
            {tasks.filter(t => t.status === col.value).map(task => (
              <Card 
                key={task._id} 
                sx={{ 
                  cursor: 'pointer', 
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  border: '1px solid #F0F4EE',
                  borderLeft: `5px solid ${task.priority === 'URGENT' ? '#D32F2F' : task.priority === 'HIGH' ? '#FBC02D' : '#3B6D11'}`,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': { 
                    transform: 'translateY(-4px)', 
                    boxShadow: '0 12px 24px rgba(0,0,0,0.08)',
                    borderColor: '#C0DD97'
                  } 
                }}
                draggable
                onDragStart={(e) => handleDragStart(e, task._id)}
                onClick={() => setViewingTask(task)}
              >
                <CardContent sx={{ p: '16px !important' }}>
                  <Typography variant="subtitle2" fontWeight="700" color="#1a2e0f" sx={{ mb: 1.5, lineHeight: 1.4 }}>
                    {task.title}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip 
                      size="small" 
                      label={task.priority} 
                      sx={{ 
                        fontSize: '10px', 
                        height: '20px', 
                        fontWeight: 'bold',
                        bgcolor: task.priority === 'URGENT' ? '#FCEBEB' : task.priority === 'HIGH' ? '#FFF9E6' : '#EAF3DE',
                        color: task.priority === 'URGENT' ? '#A32D2D' : task.priority === 'HIGH' ? '#856404' : '#3B6D11',
                      }} 
                    />
                    <Avatar sx={{ 
                      width: 28, height: 28, fontSize: '12px', bgcolor: '#C0DD97', color: '#3B6D11', fontWeight: 'bold', border: '2px solid #fff' 
                    }}>
                      {task.assigneeId ? task.assigneeId.substring(0, 2).toUpperCase() : '?'}
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            ))}
            <Button 
              fullWidth 
              startIcon={<Add />} 
              sx={{ 
                color: '#7a9e7a', 
                justifyContent: 'flex-start', 
                textTransform: 'none', 
                fontWeight: '600',
                borderRadius: '10px',
                py: 1,
                '&:hover': { bgcolor: '#EAF3DE', color: '#3B6D11' } 
              }}
              onClick={() => setIsTaskModalOpen(true)}
            >
              Add a card
            </Button>
          </Paper>
        ))}
      </Box>


      {/* Draft Task Modal */}
      <Dialog open={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: '800', color: '#1a2e0f' }}>Create New Task</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="Summary"
            fullWidth
            required
            value={newTask.title}
            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
            sx={{ mb: 3, '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3B6D11' } }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newTask.description}
            onChange={(e) => setNewTask({...newTask, description: e.target.value})}
            sx={{ mb: 3, '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3B6D11' } }}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 3 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={newTask.priority}
              label="Priority"
              onChange={(e) => setNewTask({...newTask, priority: e.target.value as TaskPriority})}
              sx={{ '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3B6D11' } }}
            >
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
              <MenuItem value="URGENT">Urgent</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Assignee</InputLabel>
            <Select
              value={newTask.assigneeId}
              label="Assignee"
              onChange={(e) => setNewTask({...newTask, assigneeId: e.target.value})}
              sx={{ '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3B6D11' } }}
            >
              <MenuItem value=""><em>Unassigned</em></MenuItem>
              {project.members?.map(m => (
                <MenuItem key={m} value={m}>{m}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setIsTaskModalOpen(false)} sx={{ color: '#7a9e7a', fontWeight: '600' }}>Cancel</Button>
          <Button 
            onClick={handleCreateTask} 
            variant="contained" 
            disabled={!newTask.title.trim()}
            sx={{ 
              background: '#3B6D11', 
              borderRadius: '8px',
              '&:hover': { background: '#2d540d' }
            }}
          >
            Create Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Member Modal */}
      <Dialog open={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: '800', color: '#1a2e0f' }}>Add Team Member</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="#7a9e7a" sx={{ mb: 3, fontWeight: '500' }}>
            Invite a teammate to collaborate on this project.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            fullWidth
            required
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3B6D11' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setIsMemberModalOpen(false)} sx={{ color: '#7a9e7a', fontWeight: '600' }}>Cancel</Button>
          <Button 
            onClick={handleAddMember} 
            variant="contained" 
            disabled={!newMember.trim()}
            sx={{ 
              background: '#3B6D11', 
              borderRadius: '8px',
              '&:hover': { background: '#2d540d' }
            }}
          >
            Add Member
          </Button>
        </DialogActions>
      </Dialog>

      {/* View/Edit Task Modal */}
      <Dialog open={!!viewingTask} onClose={() => setViewingTask(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: '800', color: '#1a2e0f' }}>Task Details</DialogTitle>
        {viewingTask && (
          <DialogContent dividers>
            <TextField
              margin="dense"
              label="Title"
              fullWidth
              value={viewingTask.title}
              onChange={(e) => setViewingTask({...viewingTask, title: e.target.value})}
              onBlur={() => handleUpdateViewingTask({ title: viewingTask.title })}
              sx={{ mb: 3, '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3B6D11' } }}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={viewingTask.description || ''}
              onChange={(e) => setViewingTask({...viewingTask, description: e.target.value})}
              onBlur={() => handleUpdateViewingTask({ description: viewingTask.description })}
              placeholder="Add a more detailed description..."
              sx={{ mb: 3, '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3B6D11' } }}
            />
            <FormControl fullWidth margin="dense" sx={{ mb: 3 }}>
              <InputLabel>Assignee</InputLabel>
              <Select
                value={viewingTask.assigneeId || ''}
                label="Assignee"
                onChange={(e) => handleUpdateViewingTask({ assigneeId: e.target.value })}
                sx={{ '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3B6D11' } }}
              >
                <MenuItem value=""><em>Unassigned</em></MenuItem>
                {project.members?.map(m => (
                  <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Status</InputLabel>
              <Select
                value={viewingTask.status}
                label="Status"
                onChange={(e) => handleUpdateViewingTask({ status: e.target.value as TaskStatus })}
                sx={{ '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3B6D11' } }}
              >
                <MenuItem value="OPEN">TO DO</MenuItem>
                <MenuItem value="IN_PROGRESS">IN PROGRESS</MenuItem>
                <MenuItem value="DONE">DONE</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
        )}
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 3, pt: 2 }}>
          <Button onClick={handleDeleteTask} color="error" variant="text" sx={{ fontWeight: '600' }}>Delete Task</Button>
          <Button 
            onClick={() => setViewingTask(null)} 
            variant="outlined"
            sx={{ 
              borderColor: '#3B6D11', 
              color: '#3B6D11',
              '&:hover': { borderColor: '#2d540d', background: '#EAF3DE' }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
