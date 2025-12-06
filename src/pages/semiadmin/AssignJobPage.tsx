import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useJobs } from '@/hooks/useJobs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Smartphone,
  Clock,
  Loader2,
  Check,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Technician {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
}

const AssignJobPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { getJobById, loading: jobsLoading } = useJobs();
  
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loadingTechs, setLoadingTechs] = useState(true);
  const [selectedTechId, setSelectedTechId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  const job = getJobById(jobId || '');

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
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
        setLoadingTechs(false);
      }
    };

    fetchTechnicians();
  }, []);

  const handleAssign = async () => {
    if (!selectedTechId || !jobId) return;

    setIsAssigning(true);
    try {
      const { data, error } = await supabase.functions.invoke('assign-job', {
        body: {
          jobId,
          technicianId: selectedTechId,
        },
      });

      if (error) throw error;

      toast.success('Technician assigned successfully');
      navigate('/semiadmin');
    } catch (error: any) {
      console.error('Error assigning job:', error);
      toast.error(error.message || 'Failed to assign technician');
    } finally {
      setIsAssigning(false);
    }
  };

  if (jobsLoading || loadingTechs) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Job not found</p>
          <Button onClick={() => navigate('/semiadmin')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (job.status !== 'unassigned') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">This job has already been assigned</p>
          <Button onClick={() => navigate('/semiadmin')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/semiadmin')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Assign Technician</h1>
              <p className="text-sm text-muted-foreground">Job {job.id.slice(0, 8).toUpperCase()}</p>
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

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Job Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{job.customer_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{job.customer_phone}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Device</p>
                  <p className="font-medium">{job.device_type}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issue</p>
                <p className="font-medium">{job.device_issue}</p>
              </div>
            </div>

            {job.time_slot && (
              <>
                <Separator />
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time Slot</p>
                    <p className="font-medium">{job.time_slot}</p>
                  </div>
                </div>
              </>
            )}

            <Separator />
            
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{job.customer_address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technician Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Technician</CardTitle>
          </CardHeader>
          <CardContent>
            {technicians.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No technicians available
              </p>
            ) : (
              <RadioGroup
                value={selectedTechId}
                onValueChange={setSelectedTechId}
                className="space-y-3"
              >
                {technicians.map((tech) => (
                  <div key={tech.id}>
                    <RadioGroupItem value={tech.id} id={tech.id} className="peer sr-only" />
                    <Label
                      htmlFor={tech.id}
                      className={cn(
                        'flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all',
                        'hover:bg-muted/50',
                        'peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={tech.avatar_url || undefined} />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{tech.name || 'Unnamed'}</p>
                          <p className="text-sm text-muted-foreground">{tech.email}</p>
                        </div>
                      </div>
                      {selectedTechId === tech.id && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/semiadmin')}
            className="flex-1"
            disabled={isAssigning}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            className="flex-1"
            disabled={!selectedTechId || isAssigning}
          >
            {isAssigning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              'Assign Technician'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssignJobPage;