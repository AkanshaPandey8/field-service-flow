import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TechnicianLayout } from '@/layouts/TechnicianLayout';
import { useJobs } from '@/hooks/useJobs';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatusCountBar } from '@/components/StatusCountBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/Loader';
import { STATUS_LABELS } from '@/types';
import { 
  User, 
  Phone, 
  MapPin, 
  Clock, 
  ChevronRight,
  Search,
  Smartphone,
  Briefcase
} from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Job = Database['public']['Tables']['jobs']['Row'];

const TechJobsList = () => {
  const { jobs, loading } = useJobs();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const activeJobs = useMemo(() => {
    return jobs.filter(job => job.status !== 'completed');
  }, [jobs]);

  const completedJobs = useMemo(() => {
    return jobs.filter(job => job.status === 'completed');
  }, [jobs]);

  const filteredActiveJobs = useMemo(() => {
    if (!searchQuery) return activeJobs;
    const query = searchQuery.toLowerCase();
    return activeJobs.filter(job =>
      job.customer_name.toLowerCase().includes(query) ||
      job.customer_phone.includes(query) ||
      job.device_type.toLowerCase().includes(query)
    );
  }, [activeJobs, searchQuery]);

  const filteredCompletedJobs = useMemo(() => {
    if (!searchQuery) return completedJobs;
    const query = searchQuery.toLowerCase();
    return completedJobs.filter(job =>
      job.customer_name.toLowerCase().includes(query) ||
      job.customer_phone.includes(query) ||
      job.device_type.toLowerCase().includes(query)
    );
  }, [completedJobs, searchQuery]);

  const JobListItem = ({ job }: { job: Job }) => (
    <Card 
      className="hover:shadow-md transition-all cursor-pointer group"
      onClick={() => navigate(`/tech/jobs/${job.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-3">
            {/* Device & Status */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{job.device_type}</p>
                <p className="text-sm text-muted-foreground truncate">{job.device_issue}</p>
              </div>
              <StatusBadge status={job.status} />
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{job.customer_name}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a 
                  href={`tel:${job.customer_phone}`} 
                  className="text-primary hover:underline"
                  onClick={e => e.stopPropagation()}
                >
                  {job.customer_phone}
                </a>
              </div>
              {job.customer_address && (
                <div className="flex items-start gap-2 text-muted-foreground sm:col-span-2">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{job.customer_address}</span>
                </div>
              )}
              {job.time_slot && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span>{job.time_slot}</span>
                </div>
              )}
            </div>
          </div>
          
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <TechnicianLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader />
        </div>
      </TechnicianLayout>
    );
  }

  return (
    <TechnicianLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Jobs</h1>
          <p className="text-muted-foreground">Welcome back, {profile?.name || 'Technician'}</p>
        </div>

        {/* Status Overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              My Job Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatusCountBar jobs={jobs} />
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active" className="gap-2">
              Active
              <Badge variant="secondary">{activeJobs.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              Completed
              <Badge variant="secondary">{completedJobs.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {filteredActiveJobs.length > 0 ? (
              <div className="space-y-3">
                {filteredActiveJobs.map(job => (
                  <JobListItem key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No jobs match your search' : 'No active jobs'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {filteredCompletedJobs.length > 0 ? (
              <div className="space-y-3">
                {filteredCompletedJobs.map(job => (
                  <JobListItem key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No jobs match your search' : 'No completed jobs'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </TechnicianLayout>
  );
};

export default TechJobsList;
