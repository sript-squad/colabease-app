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
  IconButton
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
  LogOut
} from 'lucide-react';
import { useAuth } from '../auth/authContex';

const UserDetails = () => {
  const { user, logout } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  return (
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
              {user?.username ? getInitials(user.username) : 'U'}
            </Avatar>
            <Box sx={{ pb: 1, flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#1A2E0F', letterSpacing: '-0.02em' }}>
                {user?.username || 'ColabEase User'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Chip 
                  label="Pro Member" 
                  size="small" 
                  sx={{ bgcolor: '#E0E8DC', color: '#1A2E0F', fontWeight: 600, fontSize: '0.75rem' }} 
                />
                <Typography variant="body2" sx={{ color: '#7a9e7a', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <MapPin size={14} /> Global Workspace
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
                    <InfoItem label="Full Name" value={user?.username || 'Not set'} icon={<User size={16} />} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem label="Email Address" value={user?.email || 'Not set'} icon={<Mail size={16} />} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem label="Member Since" value="April 2024" icon={<Calendar size={16} />} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem label="Role" value="Product Designer" icon={<Shield size={16} />} />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4, opacity: 0.6 }} />

                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1A2E0F' }}>
                  Bio
                </Typography>
                <Typography variant="body1" sx={{ color: '#555', lineHeight: 1.7 }}>
                  Passionate about collaborative system design and modern web technologies. 
                  Building seamless experiences for the ColabEase ecosystem. 🚀
                </Typography>
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
                    <StatRow label="Active Projects" value="12" color="#3B6D11" />
                    <StatRow label="Tasks Completed" value="84" color="#3B6D11" />
                    <StatRow label="Milestones Hit" value="7" color="#3B6D11" />
                  </Box>
                </Paper>

                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    borderRadius: 6, 
                    bgcolor: '#fff',
                    border: '1px solid rgba(0,0,0,0.06)'
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#7a9e7a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Connect & Links
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <SocialButton icon={<ExternalLink size={18} />} label="Portfolio" />
                    <SocialButton icon={<Award size={18} />} label="Certificates" />
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
              {[1, 2, 3].map((i) => (
                <Grid item xs={12} key={i}>
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
                        Updated Milestone "Deployment Phase"
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#7a9e7a' }}>
                        2 hours ago in <b>Internal Dashboard Project</b>
                      </Typography>
                    </Box>
                    <IconButton size="small">
                      <ChevronRight size={18} />
                    </IconButton>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Box>
    </Fade>
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

const SocialButton = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <Button 
    variant="outlined" 
    fullWidth
    startIcon={icon}
    sx={{ 
      borderRadius: 3, 
      textTransform: 'none', 
      borderColor: '#E0E8DC', 
      color: '#3B6D11',
      fontWeight: 600,
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
