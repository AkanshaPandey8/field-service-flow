import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wrench, Shield, User } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (role: UserRole) => {
    setLoading(true);
    try {
      const success = await login(email, password, role);
      if (success) {
        toast.success(`Logged in as ${role}`);
        navigate(role === 'admin' ? '/admin' : '/tech');
      } else {
        toast.error('Login failed');
      }
    } catch (error) {
      toast.error('Login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg mb-4">
            <Wrench className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">TechRepair</h1>
          <p className="text-muted-foreground">Job Workflow System</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="admin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="admin" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </TabsTrigger>
                <TabsTrigger value="technician" className="gap-2">
                  <User className="h-4 w-4" />
                  Technician
                </TabsTrigger>
              </TabsList>

              <div className="space-y-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <TabsContent value="admin" className="mt-0">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handleLogin('admin')}
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign in as Admin'}
                </Button>
              </TabsContent>

              <TabsContent value="technician" className="mt-0">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handleLogin('technician')}
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign in as Technician'}
                </Button>
              </TabsContent>
            </Tabs>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Demo: Click sign in with any credentials
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
