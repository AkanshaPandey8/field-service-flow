import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole } from '@/types';
import { mockUsers } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // TODO: Firebase Auth integration
    // const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Mock login - find user by role
    const mockUser = mockUsers.find(u => u.role === role);
    if (mockUser) {
      setUser(mockUser);
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    // TODO: Firebase Auth signOut
    // await signOut(auth);
    setUser(null);
    localStorage.removeItem('auth_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
