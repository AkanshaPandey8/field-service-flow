import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Briefcase, LogOut, User, Wrench } from 'lucide-react';

interface TechnicianLayoutProps {
  children: ReactNode;
}

export const TechnicianLayout = ({ children }: TechnicianLayoutProps) => {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b z-50">
        <div className="h-full max-w-2xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Wrench className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">TechRepair</p>
              <p className="text-xs text-muted-foreground">Technician Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">{profile?.name || 'Technician'}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16 pb-20">
        <div className="max-w-2xl mx-auto px-4 py-6">{children}</div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t">
        <div className="h-full max-w-2xl mx-auto flex items-center justify-around">
          <Link
            to="/tech"
            className={cn(
              'flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors',
              location.pathname === '/tech'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Briefcase className="h-5 w-5" />
            <span className="text-xs font-medium">Jobs</span>
          </Link>
          <Link
            to="/tech/profile"
            className={cn(
              'flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors',
              location.pathname === '/tech/profile'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <User className="h-5 w-5" />
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};
