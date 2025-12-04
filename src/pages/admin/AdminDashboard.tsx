import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { useJobs } from '@/context/JobsContext';
import { JobStatus, JOB_STATUS_ORDER, STATUS_LABELS, Job } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { cn } from '@/lib/utils';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  Phone,
  User,
  Clock,
  Wrench,
  Eye,
  ChevronDown,
  X,
} from 'lucide-react';
import { mockTechnicians } from '@/data/mockData';

type LayoutMode = 'columns' | 'rows';
type SortOption = 'newest' | 'oldest' | 'slot_asc' | 'slot_desc' | 'customer_az' | 'customer_za' | 'tech_az';
type TimeFilter = 'all' | 'today' | '24h' | '3d' | '7d' | 'custom';

const AdminDashboard = () => {
  const { jobs } = useJobs();
  const navigate = useNavigate();
  
  // State
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('columns');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState<JobStatus[]>([]);
  const [techFilters, setTechFilters] = useState<string[]>([]);
  const [deviceFilters, setDeviceFilters] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Get unique device types
  const deviceTypes = useMemo(() => {
    return [...new Set(jobs.map(j => j.device.type))];
  }, [jobs]);

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(job =>
        job.customer.name.toLowerCase().includes(query) ||
        job.customer.phone.includes(query) ||
        job.device.type.toLowerCase().includes(query) ||
        job.device.issue.toLowerCase().includes(query) ||
        job.technician?.name.toLowerCase().includes(query) ||
        job.jobId.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilters.length > 0) {
      result = result.filter(job => statusFilters.includes(job.status));
    }

    // Technician filter
    if (techFilters.length > 0) {
      result = result.filter(job => 
        job.technician && techFilters.includes(job.technician.techId)
      );
    }

    // Device filter
    if (deviceFilters.length > 0) {
      result = result.filter(job => deviceFilters.includes(job.device.type));
    }

    // Time filter
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
          now - new Date(job.createdAt).getTime() <= timeRanges[timeFilter]
        );
      }
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'customer_az':
          return a.customer.name.localeCompare(b.customer.name);
        case 'customer_za':
          return b.customer.name.localeCompare(a.customer.name);
        case 'tech_az':
          return (a.technician?.name || '').localeCompare(b.technician?.name || '');
        default:
          return 0;
      }
    });

    return result;
  }, [jobs, searchQuery, statusFilters, techFilters, deviceFilters, timeFilter, sortBy]);

  // Group jobs by status
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
    setTechFilters([]);
    setDeviceFilters([]);
    setTimeFilter('all');
  };

  const hasActiveFilters = searchQuery || statusFilters.length || techFilters.length || deviceFilters.length || timeFilter !== 'all';

  const JobCardCompact = ({ job }: { job: Job }) => (
    <Card 
      className="bg-card hover:shadow-md transition-all cursor-pointer group border-l-4"
      style={{ borderLeftColor: `hsl(var(--status-${job.status.replace('_', '-')}))` }}
      onClick={() => navigate(`/admin/jobs/${job.jobId}`)}
    >
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{job.device.type}</p>
              <p className="text-xs text-muted-foreground truncate">{job.device.issue}</p>
            </div>
            <StatusBadge status={job.status} size="sm" />
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span className="truncate">{job.customer.name}</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{job.customer.phone}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{job.timeSlot}</span>
            </div>
            {job.technician && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Wrench className="h-3 w-3" />
                <span className="truncate max-w-[80px]">{job.technician.name}</span>
              </div>
            )}
          </div>

          <Button
            size="sm"
            variant="ghost"
            className="w-full h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/jobs/${job.jobId}`);
            }}
          >
            <Eye className="h-3 w-3 mr-1" />
            View Job
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Job Dashboard</h1>
            <p className="text-muted-foreground">{filteredJobs.length} jobs found</p>
          </div>
          <Button onClick={() => navigate('/admin/create-job')}>
            Create New Job
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs by customer, phone, device, technician..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-2">
            {/* Status Filter */}
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

            {/* Technician Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Wrench className="h-4 w-4" />
                  Technician
                  {techFilters.length > 0 && (
                    <Badge variant="secondary" className="ml-1">{techFilters.length}</Badge>
                  )}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-3" align="start">
                <div className="space-y-2">
                  {mockTechnicians.map(tech => (
                    <label key={tech.techId} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={techFilters.includes(tech.techId)}
                        onCheckedChange={(checked) => {
                          setTechFilters(prev =>
                            checked
                              ? [...prev, tech.techId]
                              : prev.filter(t => t !== tech.techId)
                          );
                        }}
                      />
                      <span className="text-sm">{tech.name}</span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Time Filter */}
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

            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="customer_az">Customer A-Z</SelectItem>
                <SelectItem value="customer_za">Customer Z-A</SelectItem>
                <SelectItem value="tech_az">Technician A-Z</SelectItem>
              </SelectContent>
            </Select>

            {/* Layout Toggle */}
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
                      <Badge variant="secondary">{jobsByStatus[status].length}</Badge>
                    </div>
                    <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-hide">
                      {jobsByStatus[status].map(job => (
                        <JobCardCompact key={job.jobId} job={job} />
                      ))}
                      {jobsByStatus[status].length === 0 && (
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
              if (jobsByStatus[status].length === 0 && statusFilters.length > 0 && !statusFilters.includes(status)) {
                return null;
              }
              return (
                <div key={status}>
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-medium">{STATUS_LABELS[status]}</h3>
                    <Badge variant="secondary">{jobsByStatus[status].length}</Badge>
                  </div>
                  {jobsByStatus[status].length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {jobsByStatus[status].map(job => (
                        <JobCardCompact key={job.jobId} job={job} />
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
    </AdminLayout>
  );
};

export default AdminDashboard;
