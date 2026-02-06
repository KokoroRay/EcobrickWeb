import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, signOut, fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  userAttributes: any;
  role: string | null;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  getUserRole: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userAttributes, setUserAttributes] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getUserRole = async (): Promise<string | null> => {
    try {
      const session = await fetchAuthSession();
      const groups = session.tokens?.idToken?.payload['cognito:groups'] as string[] | undefined;
      
      if (groups && groups.includes('admin')) {
        return 'admin';
      }
      if (groups && groups.includes('user')) {
        return 'user';
      }
      return 'user'; // Mặc định là user nếu không có group
    } catch (error) {
      console.error('Lỗi lấy role:', error);
      return null;
    }
  };

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      const userRole = await getUserRole();
      
      setUser(currentUser);
      setUserAttributes(attributes);
      setRole(userRole);
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
      setUser(null);
      setUserAttributes(null);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setIsAuthenticated(false);
      setUser(null);
      setUserAttributes(null);
      setRole(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, userAttributes, role, isLoading, checkAuth, logout, getUserRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
