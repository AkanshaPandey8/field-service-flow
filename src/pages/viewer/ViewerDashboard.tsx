import { useState, useMemo } from 'react';
import { useJobs } from '@/hooks/useJobs';
import { useTechnicians } from '@/hooks/useTechnicians';
import { JobStatus } from '@/types';
import { StatusCountBar } from '@/components/StatusCountBar';
import { JobsTable } from '@/components/JobsTable';
import { SearchFilterBar, TimeFilter, SortOption } from '@/components/SearchFilterBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Briefcase,
  LogOut,
  User,
  Phone,
  Smartphone,
} from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Job = Database['public']['Tables']['jobs']['Row'];

const ViewerDashboard = () => {
  const { jobs, loading } = useJobs();
  const { technicians } = useTechnicians();
  const { profile, signOut } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState<JobStatus[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const technicianNames = useMemo(() => {
    const names: Record<string, string> = {};
    technicians.forEach(t => {
      names[t.id] = t.name || t.email || 'Unknown';
    });
    return names;
  }, [technicians]);

  const deviceTypes = useMemo(() => {
    return [...new Set(jobs.map(j => j.device_type))];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(job =>
        job.customer_name.toLowerCase().includes(query) ||
        job.customer_phone.includes(query) ||
        job.device_type.toLowerCase().includes(query) ||
        job.device_issue.toLowerCase().includes(query) ||
        job.id.toLowerCase().includes(query)
      );
    }

    if (statusFilters.length > 0) {
      result = result.filter(job => statusFilters.includes(job.status));
    }

    const now = Date.now();
    if (timeFilter !== 'all') {
      const timeRanges: Record<string, number> = {
        today: 24 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '3d': 3 * 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
      };
      if (timeRanges[timeFilter]) {
        result = result.filter(job => 
          now - new Date(job.created_at).getTime() <= timeRanges[timeFilter]
        );
      }
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'customer_az':
          return a.customer_name.localeCompare(b.customer_name);
        case 'customer_za':
          return b.customer_name.localeCompare(a.customer_name);
        default:
          return 0;
      }
    });

    return result;
  }, [jobs, searchQuery, statusFilters, timeFilter, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Viewer Dashboard</h1>
            <p className="text-sm text-muted-foreground">Read-only view • {jobs.length} jobs</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">{profile?.name}</span>
            <Badge variant="secondary">Viewer</Badge>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Realtime Status Counts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Realtime Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatusCountBar jobs={jobs} />
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilters={statusFilters}
          onStatusFiltersChange={setStatusFilters}
          timeFilter={timeFilter}
          onTimeFilterChange={setTimeFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          deviceTypes={deviceTypes}
        />

        {/* Jobs Table */}
        <JobsTable 
          jobs={filteredJobs} 
          variant="viewer"
          technicianNames={technicianNames}
        />
      </div>

      {/* Job Detail Modal */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>{selectedJob?.id.slice(0, 8).toUpperCase()}</span>
              {selectedJob && <StatusBadge status={selectedJob.status} />}
            </DialogTitle>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Customer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p className="font-medium">{selectedJob.customer_name}</p>
                    <p className="text-muted-foreground">{selectedJob.customer_phone}</p>
                    <p className="text-muted-foreground">{selectedJob.customer_address}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Device
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p className="font-medium">{selectedJob.device_type}</p>
                    <p className="text-muted-foreground">{selectedJob.device_issue}</p>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Service</p>
                  <p className="font-medium">₹{selectedJob.service_charge || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Parts</p>
                  <p className="font-medium">₹{selectedJob.parts_cost || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">GST</p>
                  <p className="font-medium">₹{selectedJob.gst || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-bold">₹{selectedJob.total || 0}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewerDashboard;
