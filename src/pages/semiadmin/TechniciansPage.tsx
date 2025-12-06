import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Search,
  Phone,
  Mail,
  User,
  LogOut,
} from 'lucide-react';

interface Technician {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
}

const TechniciansPage = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        // Get all users with technician role
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'technician');

        if (rolesError) throw rolesError;

        if (roles && roles.length > 0) {
          const userIds = roles.map(r => r.user_id);
          
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .in('id', userIds);

          if (profilesError) throw profilesError;
          setTechnicians(profiles || []);
        }
      } catch (error) {
        console.error('Error fetching technicians:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTechnicians();
  }, []);

  const filteredTechnicians = technicians.filter(tech => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      tech.name?.toLowerCase().includes(query) ||
      tech.email?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/semiadmin')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Technicians</h1>
              <p className="text-sm text-muted-foreground">{technicians.length} technicians</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{profile?.name}</span>
            <Badge variant="secondary">SemiAdmin</Badge>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Technicians Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Technicians</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTechnicians.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {searchQuery ? 'No technicians found' : 'No technicians registered yet'}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Technician</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTechnicians.map((tech) => (
                    <TableRow key={tech.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={tech.avatar_url || undefined} />
                            <AvatarFallback>
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{tech.name || 'Unnamed'}</p>
                            <p className="text-xs text-muted-foreground">ID: {tech.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {tech.email || 'No email'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TechniciansPage;