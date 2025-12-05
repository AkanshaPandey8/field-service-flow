import { Navigate } from 'react-router-dom';
import { useAuth, AppRole } from '@/context/AuthContext';
import { ReactNode } from 'react';
import { Loader } from '@/components/Loader';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect based on role
    if (role === 'admin' || role === 'semiadmin') {
      return <Navigate to="/admin" replace />;
    } else if (role === 'technician') {
      return <Navigate to="/tech" replace />;
    } else {
      return <Navigate to="/viewer" replace />;
    }
  }

  return <>{children}</>;
};
