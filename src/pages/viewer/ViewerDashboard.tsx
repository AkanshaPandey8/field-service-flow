import { useState, useMemo } from 'react';
import { useJobs } from '@/hooks/useJobs';
import { JOB_STATUS_ORDER, STATUS_LABELS } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
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
  Eye,
  LogOut,
  Smartphone,
} from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type JobStatus = Database['public']['Enums']['job_status'];
type Job = Database['public']['Tables']['jobs']['Row'];
type LayoutMode = 'columns' | 'rows';
type SortOption = 'newest' | 'oldest' | 'customer_az' | 'customer_za';
type TimeFilter = 'all' | 'today' | '24h' | '3d' | '7d';

const ViewerDashboard = () => {
  const { jobs, loading } = useJobs();
  const { profile, signOut } = useAuth();
  
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('columns');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState<JobStatus[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

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

  const JobCardCompact = ({ job }: { job: Job }) => (
    <Card 
      className="bg-card hover:shadow-md transition-all cursor-pointer group border-l-4"
      style={{ borderLeftColor: `hsl(var(--status-${job.status.replace('_', '-')}))` }}
      onClick={() => setSelectedJob(job)}
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

          <Button
            size="sm"
            variant="ghost"
            className="w-full h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Eye className="h-3 w-3 mr-1" />
            View Details
          </Button>
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
            <h1 className="text-xl font-bold text-foreground">Job Dashboard</h1>
            <p className="text-sm text-muted-foreground">Read-only view • {filteredJobs.length} jobs</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{profile?.name}</span>
            <Badge variant="secondary">Viewer</Badge>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
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
                    <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-hide">
                      {jobsByStatus[status]?.map(job => (
                        <JobCardCompact key={job.id} job={job} />
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
                        <JobCardCompact key={job.id} job={job} />
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
              <div className="grid grid-cols-2 gap-4">
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
                    {selectedJob.time_slot && (
                      <p className="text-muted-foreground">{selectedJob.time_slot}</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {selectedJob.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground">{selectedJob.notes}</p>
                  </div>
                </>
              )}

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