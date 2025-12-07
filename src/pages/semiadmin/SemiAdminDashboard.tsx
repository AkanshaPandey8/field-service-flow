import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import {
  Briefcase,
  Users,
  LogOut,
} from 'lucide-react';

const SemiAdminDashboard = () => {
  const { jobs, loading } = useJobs();
  const { technicians } = useTechnicians();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState<JobStatus[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const unassignedJobs = useMemo(() => {
    return jobs.filter(job => job.status === 'unassigned');
  }, [jobs]);

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

  const handleAssign = (jobId: string) => {
    navigate(`/semiadmin/assign/${jobId}`);
  };

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
            <h1 className="text-xl font-bold text-foreground">SemiAdmin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {unassignedJobs.length} jobs awaiting assignment
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/semiadmin/technicians')}>
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Technicians</span>
            </Button>
            <span className="text-sm text-muted-foreground hidden sm:block">{profile?.name}</span>
            <Badge variant="secondary">SemiAdmin</Badge>
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

        <Tabs defaultValue="unassigned" className="space-y-6">
          <TabsList>
            <TabsTrigger value="unassigned" className="gap-2">
              Unassigned Jobs
              <Badge variant="secondary">{unassignedJobs.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="all">All Jobs</TabsTrigger>
          </TabsList>

          <TabsContent value="unassigned" className="space-y-4">
            {unassignedJobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No unassigned jobs at the moment</p>
                </CardContent>
              </Card>
            ) : (
              <JobsTable 
                jobs={unassignedJobs} 
                variant="semiadmin"
                onAssign={handleAssign}
                technicianNames={technicianNames}
              />
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
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
              variant="semiadmin"
              onAssign={handleAssign}
              technicianNames={technicianNames}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SemiAdminDashboard;
