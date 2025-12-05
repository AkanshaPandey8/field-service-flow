import { TechnicianLayout } from '@/layouts/TechnicianLayout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, Mail, LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TechProfilePage = () => {
  const { profile, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <TechnicianLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">
                  {profile?.name?.charAt(0) || 'T'}
                </span>
              </div>
              <div>
                <CardTitle>{profile?.name || 'Technician'}</CardTitle>
                <p className="text-muted-foreground capitalize">{role || 'Technician'}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{profile?.email || 'No email'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="capitalize">{role || 'technician'}</span>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <Button variant="destructive" onClick={handleLogout} className="w-full">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </TechnicianLayout>
  );
};

export default TechProfilePage;
