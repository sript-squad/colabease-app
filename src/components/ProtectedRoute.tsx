
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../auth/authContex';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    login(); // redirect straight to Cognito Hosted UI
    return null;
  }

  return <>{children}</>;
}