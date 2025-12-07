import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { useJobs } from '@/hooks/useJobs';
import { useTechnicians } from '@/hooks/useTechnicians';
import { JOB_STATUS_ORDER, STATUS_LABELS, JobStatus } from '@/types';
import { StatusCountBar } from '@/components/StatusCountBar';
import { JobsTable } from '@/components/JobsTable';
import { SearchFilterBar, TimeFilter, SortOption } from '@/components/SearchFilterBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Briefcase } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Job = Database['public']['Tables']['jobs']['Row'];

const AdminDashboard = () => {
  const { jobs, loading } = useJobs();
  const { technicians } = useTechnicians();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState<JobStatus[]>([]);
  const [deviceFilters, setDeviceFilters] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const deviceTypes = useMemo(() => {
    return [...new Set(jobs.map(j => j.device_type))];
  }, [jobs]);

  const technicianNames = useMemo(() => {
    const names: Record<string, string> = {};
    technicians.forEach(t => {
      names[t.id] = t.name || t.email || 'Unknown';
    });
    return names;
  }, [technicians]);

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

    if (deviceFilters.length > 0) {
      result = result.filter(job => deviceFilters.includes(job.device_type));
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
  }, [jobs, searchQuery, statusFilters, deviceFilters, timeFilter, sortBy]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">{jobs.length} total jobs</p>
          </div>
          <Button onClick={() => navigate('/admin/create-job')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Job
          </Button>
        </div>

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
          deviceFilters={deviceFilters}
          onDeviceFiltersChange={setDeviceFilters}
        />

        {/* Jobs Table */}
        <JobsTable 
          jobs={filteredJobs} 
          variant="admin"
          technicianNames={technicianNames}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
