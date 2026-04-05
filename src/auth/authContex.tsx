import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  fetchAuthSession,
  getCurrentUser,
  signInWithRedirect,
  signOut,
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

interface AuthTokens {
  accessToken: string;
  idToken: string;
}

interface AuthUser {
  username: string;
  userId: string;
  email?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  tokens: AuthTokens | null;
  user: AuthUser | null;
  login: () => void;                            // redirects to Cognito Hosted UI
  logout: () => Promise<void>;
  refreshTokens: () => Promise<AuthTokens | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  const loadSession = async () => {
    try {
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();

      const accessToken = session.tokens?.accessToken?.toString() ?? '';
      const idToken = session.tokens?.idToken?.toString() ?? '';

      // Extract email from id token claims
      const email = session.tokens?.idToken?.payload?.email as string | undefined;

      setTokens({ accessToken, idToken });
      setUser({ username: currentUser.username, userId: currentUser.userId, email });
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
      setTokens(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSession();

    // Hub listens for Amplify auth events (signIn, signOut, tokenRefresh, etc.)
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signInWithRedirect':       // fired after callback redirect is processed
          loadSession();
          break;
        case 'signInWithRedirect_failure':
          console.error('Hosted UI sign-in failed:', payload.data);
          setIsLoading(false);
          break;
        case 'signedOut':
          setIsAuthenticated(false);
          setTokens(null);
          setUser(null);
          break;
        case 'tokenRefresh':
          loadSession();                 // update tokens state after refresh
          break;
      }
    });

    return unsubscribe;
  }, []);

  const login = () => {
    signInWithRedirect(); // redirects browser to Cognito Hosted UI
  };

  const logout = async () => {
    await signOut({ global: true }); // global: true invalidates all sessions
  };

  const refreshTokens = async (): Promise<AuthTokens | null> => {
    try {
      const session = await fetchAuthSession({ forceRefresh: true });
      const accessToken = session.tokens?.accessToken?.toString() ?? '';
      const idToken = session.tokens?.idToken?.toString() ?? '';
      const newTokens = { accessToken, idToken };
      setTokens(newTokens);
      return newTokens;
    } catch {
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, tokens, user, login, logout, refreshTokens }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};