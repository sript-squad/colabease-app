import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useAuth } from '../auth/authContex';
import logoImg from '../assets/logo.png';

export default function Landing() {
  const [logoError, setLogoError] = useState(false);
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) return null; // Or a loading spinner

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f7f2', fontFamily: '"Inter", "Arial", sans-serif' }}>
      {/* Header */}
      <Box sx={{ py: 3, px: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fff', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!logoError ? (
            <img 
              src={logoImg} 
              alt="Colabease Logo" 
              style={{ height: '32px' }} 
              onError={() => setLogoError(true)} 
            />
          ) : (
            <Typography variant="h6" fontWeight="bold" color="#1a2e0f">Colabease</Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button onClick={login} sx={{ color: '#3B6D11', textTransform: 'none', fontWeight: 600 }}>Log In</Button>
          <Button onClick={login} variant="contained" disableElevation sx={{ bgcolor: '#3B6D11', '&:hover': { bgcolor: '#27500A' }, textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>Sign Up</Button>
        </Box>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 10 }, textAlign: 'center' }}>
        <Typography variant="h2" fontWeight="800" color="#1a2e0f" sx={{ mb: 3, letterSpacing: '-1px', fontSize: { xs: '2.5rem', md: '3.75rem' } }}>
          Manage your projects with <Box component="span" sx={{ color: '#3B6D11' }}>unmatched ease</Box>.
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 5, maxWidth: '800px', mx: 'auto', fontWeight: 400, lineHeight: 1.6 }}>
          Colabease combines seamless team communication with intelligent, project aware task suggestions in a beautiful, fast, and agile workflow designed to keep your team entirely in sync.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 8 }}>
          <Button onClick={login} variant="contained" size="large" disableElevation sx={{ bgcolor: '#3B6D11', '&:hover': { bgcolor: '#27500A' }, textTransform: 'none', fontWeight: 600, borderRadius: 3, px: 4, py: 1.5, fontSize: '1.1rem' }}>
            Get Started for Free <ArrowForward sx={{ ml: 1, fontSize: 20 }} />
          </Button>
        </Box>

        {/* Dashboard Promo Image */}
        <Box sx={{ position: 'relative', maxWidth: '1000px', mx: 'auto', borderRadius: 4, overflow: 'hidden', boxShadow: '0 20px 40px rgba(59, 109, 17, 0.15)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <img src="/dashboard-image.png" alt="Colabease Project Dashboard" style={{ width: '100%', display: 'block' }} />
        </Box>
      </Container>      

      {/* Footer */}
      <Box sx={{ bgcolor: '#1a2e0f', py: 6, color: '#fff', textAlign: 'center' }}>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          © {new Date().getFullYear()} Colabease Inc. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
