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
import { Project } from '../types/Project.types';
import { Task, TaskStatus, TaskPriority } from '../types/Task.types';

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

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
    } catch (e) {
      console.error(e);
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
    try {
      const updatedMembers = [...(project.members || []), newMember.trim()];
      await projectService.update(id, { members: updatedMembers });
      setIsMemberModalOpen(false);
      setNewMember('');
      fetchProjectData();
    } catch (e) {
      console.error('Failed to add member', e);
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
    <Box sx={{ p: 0, fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        borderBottom: '1px solid rgba(0,0,0,0.05)', mb: 3, pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/projects')}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight="bold" color="#1a2e0f">
              {project.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {project.description || 'No description provided.'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '14px' } }}>
            {project.members?.map(m => (
              <Avatar key={m}>{m.substring(0, 2).toUpperCase()}</Avatar>
            ))}
          </AvatarGroup>
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<PersonAdd />}
            sx={{ textTransform: 'none', borderColor: '#C0DD97', color: '#3B6D11' }}
            onClick={() => setIsMemberModalOpen(true)}
          >
            Add Member
          </Button>
        </Box>
      </Box>

      {/* Board */}
      <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', pb: 2, minHeight: '60vh' }}>
        {columns.map(col => (
          <Paper 
            key={col.value} 
            sx={{ 
              flex: '0 0 320px', 
              bgcolor: '#f4f5f7', 
              p: 2, 
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
            elevation={0}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col.value)}
          >
            <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
              {col.title} • {tasks.filter(t => t.status === col.value).length}
            </Typography>
            
            {tasks.filter(t => t.status === col.value).map(task => (
              <Card 
                key={task._id} 
                sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}
                draggable
                onDragStart={(e) => handleDragStart(e, task._id)}
                onClick={() => setViewingTask(task)}
              >
                <CardContent sx={{ p: '12px !important' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>{task.title}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip size="small" label={task.priority} sx={{ fontSize: '10px', height: '20px' }} />
                    <Avatar sx={{ width: 24, height: 24, fontSize: '10px' }}>
                      {task.assigneeId ? task.assigneeId.substring(0, 2).toUpperCase() : '?'}
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            ))}

            <Button 
              fullWidth 
              startIcon={<Add />} 
              sx={{ color: '#5e6c84', justifyContent: 'flex-start', textTransform: 'none', '&:hover': { bgcolor: 'rgba(9, 30, 66, 0.08)' } }}
              onClick={() => setIsTaskModalOpen(true)}
            >
              Create issue
            </Button>
          </Paper>
        ))}
      </Box>

      {/* Draft Task Modal */}
      <Dialog open={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="Summary"
            fullWidth
            required
            value={newTask.title}
            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newTask.description}
            onChange={(e) => setNewTask({...newTask, description: e.target.value})}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Priority</InputLabel>
            <Select
              value={newTask.priority}
              label="Priority"
              onChange={(e) => setNewTask({...newTask, priority: e.target.value as TaskPriority})}
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
            >
              <MenuItem value=""><em>Unassigned</em></MenuItem>
              {project.members?.map(m => (
                <MenuItem key={m} value={m}>{m}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsTaskModalOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained" disabled={!newTask.title.trim()}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Add Member Modal */}
      <Dialog open={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Team Member</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter the name or email of the team member you'd like to add to this project.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Member Name or Email"
            fullWidth
            required
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsMemberModalOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleAddMember} variant="contained" disabled={!newMember.trim()}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* View/Edit Task Modal */}
      <Dialog open={!!viewingTask} onClose={() => setViewingTask(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Task Details</DialogTitle>
        {viewingTask && (
          <DialogContent dividers>
            <TextField
              margin="dense"
              label="Title"
              fullWidth
              value={viewingTask.title}
              onChange={(e) => setViewingTask({...viewingTask, title: e.target.value})}
              onBlur={() => handleUpdateViewingTask({ title: viewingTask.title })}
              sx={{ mb: 2 }}
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
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
              <InputLabel>Assignee</InputLabel>
              <Select
                value={viewingTask.assigneeId || ''}
                label="Assignee"
                onChange={(e) => handleUpdateViewingTask({ assigneeId: e.target.value })}
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
              >
                <MenuItem value="OPEN">TO DO</MenuItem>
                <MenuItem value="IN_PROGRESS">IN PROGRESS</MenuItem>
                <MenuItem value="DONE">DONE</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
        )}
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Button onClick={handleDeleteTask} color="error" variant="outlined">Delete Task</Button>
          <Button onClick={() => setViewingTask(null)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
