import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '@/hooks/useJobs';
import { JOB_STATUS_ORDER, STATUS_LABELS } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  Phone,
  User,
  Clock,
  ChevronDown,
  X,
  UserPlus,
  Users,
  LogOut,
} from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type JobStatus = Database['public']['Enums']['job_status'];
type Job = Database['public']['Tables']['jobs']['Row'];
type LayoutMode = 'columns' | 'rows';
type SortOption = 'newest' | 'oldest' | 'customer_az' | 'customer_za';
type TimeFilter = 'all' | 'today' | '24h' | '3d' | '7d';

const SemiAdminDashboard = () => {
  const { jobs, loading } = useJobs();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('columns');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState<JobStatus[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const unassignedJobs = useMemo(() => {
    return jobs.filter(job => job.status === 'unassigned');
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

  const jobsByStatus = useMemo(() => {
    const grouped: Record<JobStatus, Job[]> = {} as Record<JobStatus, Job[]>;
    JOB_STATUS_ORDER.forEach(status => {
      grouped[status] = filteredJobs.filter(job => job.status === status);
    });
    return grouped;
  }, [filteredJobs]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilters([]);
    setTimeFilter('all');
  };

  const hasActiveFilters = searchQuery || statusFilters.length || timeFilter !== 'all';

  const JobCardCompact = ({ job, showAssign = false }: { job: Job; showAssign?: boolean }) => (
    <Card 
      className="bg-card hover:shadow-md transition-all cursor-pointer group border-l-4"
      style={{ borderLeftColor: `hsl(var(--status-${job.status.replace('_', '-')}))` }}
    >
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{job.device_type}</p>
              <p className="text-xs text-muted-foreground truncate">{job.device_issue}</p>
            </div>
            <StatusBadge status={job.status} size="sm" />
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span className="truncate">{job.customer_name}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{job.customer_phone}</span>
          </div>
          
          {job.time_slot && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{job.time_slot}</span>
            </div>
          )}

          {showAssign && (
            <Button
              size="sm"
              className="w-full h-8 text-xs"
              onClick={() => navigate(`/semiadmin/assign/${job.id}`)}
            >
              <UserPlus className="h-3 w-3 mr-1" />
              Assign Technician
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-72 space-y-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">SemiAdmin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {unassignedJobs.length} unassigned jobs • {filteredJobs.length} total jobs
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/semiadmin/technicians')}>
              <Users className="h-4 w-4 mr-2" />
              Technicians
            </Button>
            <span className="text-sm text-muted-foreground">{profile?.name}</span>
            <Badge variant="secondary">SemiAdmin</Badge>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {unassignedJobs.map(job => (
                  <JobCardCompact key={job.id} job={job} showAssign />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer, phone, device, job ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Status
                      {statusFilters.length > 0 && (
                        <Badge variant="secondary" className="ml-1">{statusFilters.length}</Badge>
                      )}
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-3" align="start">
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {JOB_STATUS_ORDER.map(status => (
                          <label key={status} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={statusFilters.includes(status)}
                              onCheckedChange={(checked) => {
                                setStatusFilters(prev =>
                                  checked
                                    ? [...prev, status]
                                    : prev.filter(s => s !== status)
                                );
                              }}
                            />
                            <span className="text-sm">{STATUS_LABELS[status]}</span>
                          </label>
                        ))}
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>

                <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
                  <SelectTrigger className="w-32 h-9">
                    <SelectValue placeholder="Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="24h">Last 24h</SelectItem>
                    <SelectItem value="3d">Last 3 Days</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-36 h-9">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="customer_az">Customer A-Z</SelectItem>
                    <SelectItem value="customer_za">Customer Z-A</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-lg overflow-hidden">
                  <Button
                    variant={layoutMode === 'columns' ? 'default' : 'ghost'}
                    size="sm"
                    className="rounded-none"
                    onClick={() => setLayoutMode('columns')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={layoutMode === 'rows' ? 'default' : 'ghost'}
                    size="sm"
                    className="rounded-none"
                    onClick={() => setLayoutMode('rows')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Kanban Board */}
            {layoutMode === 'columns' ? (
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max">
                  {JOB_STATUS_ORDER.map(status => (
                    <div key={status} className="w-72 flex-shrink-0">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-sm">{STATUS_LABELS[status]}</h3>
                          <Badge variant="secondary">{jobsByStatus[status]?.length || 0}</Badge>
                        </div>
                        <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto scrollbar-hide">
                          {jobsByStatus[status]?.map(job => (
                            <JobCardCompact key={job.id} job={job} showAssign={status === 'unassigned'} />
                          ))}
                          {(!jobsByStatus[status] || jobsByStatus[status].length === 0) && (
                            <p className="text-sm text-muted-foreground text-center py-8">
                              No jobs
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {JOB_STATUS_ORDER.map(status => {
                  const statusJobs = jobsByStatus[status] || [];
                  if (statusJobs.length === 0 && statusFilters.length > 0 && !statusFilters.includes(status)) {
                    return null;
                  }
                  return (
                    <div key={status}>
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-medium">{STATUS_LABELS[status]}</h3>
                        <Badge variant="secondary">{statusJobs.length}</Badge>
                      </div>
                      {statusJobs.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {statusJobs.map(job => (
                            <JobCardCompact key={job.id} job={job} showAssign={status === 'unassigned'} />
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground py-4">No jobs in this status</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SemiAdminDashboard;