import { TechnicianLayout } from '@/layouts/TechnicianLayout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TechProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
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
                  {user?.name?.charAt(0) || 'T'}
                </span>
              </div>
              <div>
                <CardTitle>{user?.name}</CardTitle>
                <p className="text-muted-foreground">Technician</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>+91 98765 43210</span>
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
