import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Avatar, 
  Paper, 
  Grid, 
  Button, 
  Divider,
  Chip,
  Fade,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Edit3, 
  MapPin, 
  ExternalLink,
  Award,
  Activity,
  History,
  LogOut,
  Phone,
  Briefcase,
  Link as LinkIcon
} from 'lucide-react';
import { GitHub, LinkedIn } from '@mui/icons-material';
import { useAuth } from '../auth/authContex';
import { authService } from '../services/authService';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';

const UserDetails = () => {
  const { user, logout } = useAuth();
  const [show, setShow] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    role: '',
    bio: '',
    avatar: '',
    title: '',
    location: '',
    phone: '',
    skills: '',
    github: '',
    linkedin: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [stats, setStats] = useState({ activeProjects: 0, completedTasks: 0 });
  const [activities, setActivities] = useState<any[]>([]);

  const getTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) {
       const minutes = Math.floor(diff / (1000 * 60));
       return minutes > 0 ? `${minutes} minutes ago` : 'Just now';
    }
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  const loadProfile = async () => {
    try {
      const res = await authService.getMe();
      setProfile(res.data);
      setFormData({
        fullName: res.data?.fullName || user?.username || '',
        role: res.data?.role || '',
        bio: res.data?.bio || '',
        avatar: res.data?.avatar || '',
        title: res.data?.title || '',
        location: res.data?.location || '',
        phone: res.data?.phone || '',
        skills: res.data?.skills?.join(', ') || '',
        github: res.data?.socialLinks?.github || '',
        linkedin: res.data?.socialLinks?.linkedin || ''
      });

      // Fetch projects and tasks
      try {
        const [projectsRes, tasksRes] = await Promise.all([
          projectService.getAll(),
          taskService.getAll()
        ]);
        const activeProjects = projectsRes.data?.filter((p: any) => p.status === 'planning' || p.status === 'in_progress')?.length || 0;
        const completedTasks = tasksRes.data?.filter((t: any) => t.status === 'DONE')?.length || 0;
        setStats({ activeProjects, completedTasks });

        const recentTasks = tasksRes.data?.map((t: any) => ({
           id: t._id,
           message: `Updated task "${t.title}" to status ${t.status}`,
           context: projectsRes.data?.find((p: any) => p._id === t.projectId)?.name || 'Unknown Project',
           timestamp: new Date(t.updatedAt || t.createdAt || Date.now()).getTime(),
           dateStr: t.updatedAt || t.createdAt
        })) || [];
        recentTasks.sort((a: any, b: any) => b.timestamp - a.timestamp);
        setActivities(recentTasks.slice(0, 5));
      } catch (err) {
        console.error('Error loading contributions stats', err);
      }
    } catch (err) {
      console.error('Error loading profile', err);
    }
  };

  useEffect(() => {
    setShow(true);
    loadProfile();
  }, [user]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 200;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const base64Avatar = canvas.toDataURL('image/webp', 0.8);
          setFormData(prev => ({ ...prev, avatar: base64Avatar }));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        socialLinks: {
          github: formData.github,
          linkedin: formData.linkedin
        }
      };
      
      const { github, linkedin, ...finalPayload } = payload;
      
      const res = await authService.updateMe(finalPayload as any);
      
      // Update local profile state instantly from response
      if (res.data) {
         setProfile(res.data);
      }
      
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
      setEditOpen(false);
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
    }
  };


  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  return (
    <>
      <Fade in={show} timeout={800}>
        <Box sx={{ maxWidth: 1000, margin: '0 auto', p: { xs: 2, md: 4 } }}>
          {/* Header / Banner area */}
          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: 6, 
              overflow: 'hidden', 
              position: 'relative',
              background: 'linear-gradient(135deg, #1A2E0F 0%, #3B6D11 100%)',
              height: 220,
              mb: -8
            }}
          >
            <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
              <Button 
                variant="contained" 
                startIcon={<Edit3 size={16} />}
                onClick={() => setEditOpen(true)}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  backdropFilter: 'blur(10px)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  color: 'white',
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Edit Profile
              </Button>
            </Box>
          </Paper>

          {/* Profile Card Overlay */}
          <Box sx={{ px: { xs: 2, md: 6 }, position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 4, flexWrap: 'wrap', gap: 3 }}>
              <Avatar 
                src={profile?.avatar || ''}
                sx={{ 
                  width: 140, 
                  height: 140, 
                  border: '6px solid white', 
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  bgcolor: '#3B6D11',
                  fontSize: '3rem',
                  fontWeight: 700
                }}
              >
                {!profile?.avatar && (user?.username ? getInitials(user.username) : 'U')}
              </Avatar>
              <Box sx={{ pb: 1, flex: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1A2E0F', letterSpacing: '-0.02em' }}>
                  {profile?.fullName || user?.username || 'ColabEase User'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                  <Chip 
                    label={profile?.title || 'Pro Member'} 
                    size="small" 
                    sx={{ bgcolor: '#E0E8DC', color: '#1A2E0F', fontWeight: 600, fontSize: '0.75rem' }} 
                  />
                  <Typography variant="body2" sx={{ color: '#7a9e7a', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <MapPin size={14} /> {profile?.location || 'Global Workspace'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Grid container spacing={3}>
              {/* Left Column: Info */}
              <Grid item xs={12} md={7}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 4, 
                    borderRadius: 6, 
                    border: '1px solid rgba(0,0,0,0.04)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                    height: '100%'
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1A2E0F', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <User size={20} style={{ color: '#3B6D11' }} /> Personal Information
                  </Typography>
                  
                  <Grid container spacing={4}>
                    <Grid item xs={12} sm={6}>
                      <InfoItem label="Full Name" value={profile?.fullName || user?.username || 'Not set'} icon={<User size={16} />} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoItem label="Email Address" value={user?.email || 'Not set'} icon={<Mail size={16} />} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoItem label="Phone Number" value={profile?.phone || 'Not set'} icon={<Phone size={16} />} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoItem label="Role" value={profile?.role || 'Not set'} icon={<Shield size={16} />} />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 4, opacity: 0.6 }} />

                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1A2E0F' }}>
                    Bio
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#555', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {profile?.bio || 'Passionate about collaborative system design and modern web technologies. Building seamless experiences for the ColabEase ecosystem. 🚀'}
                  </Typography>

                  {profile?.skills && profile.skills.length > 0 && (
                    <>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, mt: 4, color: '#1A2E0F' }}>
                        Skills & Expertise
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {profile.skills.map((skill: string, index: number) => (
                          <Chip 
                            key={index}
                            label={skill} 
                            sx={{ 
                              bgcolor: 'rgba(59,109,17,0.08)', 
                              color: '#3B6D11', 
                              fontWeight: 600,
                              borderColor: 'rgba(59,109,17,0.2)',
                              border: '1px solid'
                            }} 
                          />
                        ))}
                      </Box>
                    </>
                  )}

                  {(profile?.socialLinks?.github || profile?.socialLinks?.linkedin) && (
                    <>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, mt: 4, color: '#1A2E0F' }}>
                        Social Links
                      </Typography>
                      <Grid container spacing={2}>
                        {profile?.socialLinks?.github && (
                           <Grid item xs={12} sm={6}>
                             <SocialButton icon={<GitHub sx={{ fontSize: 18 }} />} label="GitHub Profile" onClick={() => window.open(profile.socialLinks.github, '_blank')} />
                           </Grid>
                        )}
                        {profile?.socialLinks?.linkedin && (
                           <Grid item xs={12} sm={6}>
                             <SocialButton icon={<LinkedIn sx={{ fontSize: 18 }} />} label="LinkedIn Profile" onClick={() => window.open(profile.socialLinks.linkedin, '_blank')} />
                           </Grid>
                        )}
                      </Grid>
                    </>
                  )}
                </Paper>
              </Grid>

              {/* Right Column: Stats & Social */}
              <Grid item xs={12} md={5}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 4, 
                      borderRadius: 6, 
                      bgcolor: '#F8FAF7',
                      border: '1px solid #E0E8DC'
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1A2E0F', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Activity size={20} style={{ color: '#3B6D11' }} /> Contributions
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      <StatRow label="Active Projects" value={stats.activeProjects.toString()} color="#3B6D11" />
                      <StatRow label="Tasks Completed" value={stats.completedTasks.toString()} color="#3B6D11" />
                    </Box>
                  </Paper>

                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3, 
                      borderRadius: 6, 
                      bgcolor: 'rgba(211, 47, 47, 0.02)',
                      border: '1px solid rgba(211, 47, 47, 0.1)'
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#d32f2f', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Security & Session
                    </Typography>
                    <Button 
                      variant="outlined" 
                      fullWidth
                      startIcon={<LogOut size={18} />}
                      onClick={logout}
                      sx={{ 
                        borderRadius: 3, 
                        textTransform: 'none', 
                        borderColor: 'rgba(211, 47, 47, 0.2)', 
                        color: '#d32f2f',
                        fontWeight: 600,
                        '&:hover': { 
                          borderColor: '#d32f2f', 
                          bgcolor: 'rgba(211, 47, 47, 0.04)',
                          boxShadow: '0 2px 8px rgba(211, 47, 47, 0.08)'
                        }
                      }}
                    >
                      Log Out of Account
                    </Button>
                  </Paper>
                </Box>
              </Grid>
            </Grid>

            {/* Activity Section */}
            <Box sx={{ mt: 6, mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: '#1A2E0F', display: 'flex', alignItems: 'center', gap: 2 }}>
                <History size={24} style={{ color: '#3B6D11' }} /> Recent Activity
              </Typography>
              <Grid container spacing={3}>
                {activities.length > 0 ? activities.map((activity) => (
                  <Grid item xs={12} key={activity.id}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2, 
                        px: 3,
                        borderRadius: 4, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        border: '1px solid rgba(0,0,0,0.03)',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateX(8px)', bgcolor: '#F8FAF7' }
                      }}
                    >
                      <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#E0E8DC', color: '#3B6D11' }}>
                        <Activity size={20} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {activity.message}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#7a9e7a' }}>
                          {getTimeAgo(activity.dateStr)} in <b>{activity.context}</b>
                        </Typography>
                      </Box>
                      <IconButton size="small">
                        <ChevronRight size={18} />
                      </IconButton>
                    </Paper>
                  </Grid>
                )) : (
                  <Grid item xs={12}>
                    <Typography variant="body1" sx={{ color: '#7a9e7a', fontStyle: 'italic', pl: 2 }}>
                       No recent activities found.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* Edit Profile Dialog */}
      <Dialog 
        open={editOpen} 
        onClose={() => setEditOpen(false)}
        PaperProps={{ sx: { borderRadius: 4, width: '100%', maxWidth: 500 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1A2E0F' }}>Edit Profile</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 1 }}>
            <TextField
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleEditChange}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleEditChange}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Title (e.g. Senior Developer)"
              name="title"
              value={formData.title}
              onChange={handleEditChange}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleEditChange}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleEditChange}
              fullWidth
              variant="outlined"
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, mt: 1 }}>
              <Avatar src={formData.avatar} sx={{ width: 64, height: 64, bgcolor: '#3B6D11' }}>
                {user?.username?.[0]?.toUpperCase()}
              </Avatar>
              <Button
                variant="outlined"
                component="label"
                sx={{
                  borderColor: '#E0E8DC',
                  color: '#3B6D11',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': { borderColor: '#3B6D11', bgcolor: 'rgba(59,109,17,0.04)' }
                }}
              >
                Upload Profile Photo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
            </Box>
            <TextField
              label="Bio"
              name="bio"
              value={formData.bio}
              onChange={handleEditChange}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
            />
            <TextField
              label="Skills (comma separated)"
              name="skills"
              value={formData.skills}
              onChange={handleEditChange}
              fullWidth
              variant="outlined"
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="GitHub URL"
                  name="github"
                  value={formData.github}
                  onChange={handleEditChange}
                  fullWidth
                  variant="outlined"
                />
                <TextField
                  label="LinkedIn URL"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleEditChange}
                  fullWidth
                  variant="outlined"
                />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ color: '#555', fontWeight: 600 }}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            sx={{ 
              bgcolor: '#3B6D11', 
              '&:hover': { bgcolor: '#2a4d0c' },
              fontWeight: 600,
              borderRadius: 2
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

// Helper Components
const InfoItem = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
    <Typography variant="caption" sx={{ color: '#7a9e7a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {icon} {label}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1A2E0F' }}>
      {value}
    </Typography>
  </Box>
);

const StatRow = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Typography variant="body1" sx={{ color: '#555', fontWeight: 500 }}>{label}</Typography>
    <Typography variant="h6" sx={{ fontWeight: 800, color: color }}>{value}</Typography>
  </Box>
);

const SocialButton = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) => (
  <Button 
    variant="outlined" 
    fullWidth
    startIcon={icon}
    onClick={onClick}
    sx={{ 
      borderRadius: 3, 
      justifyContent: 'flex-start',
      textTransform: 'none', 
      borderColor: '#E0E8DC', 
      color: '#3B6D11',
      fontWeight: 600,
      px: 2,
      py: 1,
      '&:hover': { borderColor: '#3B6D11', bgcolor: 'rgba(59,109,17,0.04)' }
    }}
  >
    {label}
  </Button>
);

const ChevronRight = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default UserDetails;
