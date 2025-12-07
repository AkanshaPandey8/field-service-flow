import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Phone, User, Clock, MapPin } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { format } from 'date-fns';

type Job = Database['public']['Tables']['jobs']['Row'];

interface JobsTableProps {
  jobs: Job[];
  variant: 'admin' | 'semiadmin' | 'viewer' | 'technician';
  onAssign?: (jobId: string) => void;
  technicianNames?: Record<string, string>;
}

export const JobsTable = ({ jobs, variant, onAssign, technicianNames = {} }: JobsTableProps) => {
  const navigate = useNavigate();

  const handleView = (job: Job) => {
    if (variant === 'admin') {
      navigate(`/admin/jobs/${job.id}`);
    } else if (variant === 'semiadmin') {
      navigate(`/semiadmin/jobs/${job.id}`);
    } else if (variant === 'technician') {
      navigate(`/tech/jobs/${job.id}`);
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No jobs found
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[100px]">Job ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Device</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Time Slot</TableHead>
            {variant !== 'technician' && <TableHead>Technician</TableHead>}
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map(job => (
            <TableRow key={job.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => handleView(job)}>
              <TableCell className="font-mono text-xs">
                {job.id.slice(0, 8).toUpperCase()}
              </TableCell>
              <TableCell>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium text-sm">{job.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{job.customer_phone}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-0.5">
                  <p className="font-medium text-sm">{job.device_type}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">{job.device_issue}</p>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={job.status} size="sm" />
              </TableCell>
              <TableCell>
                {job.time_slot ? (
                  <div className="flex items-center gap-1.5 text-sm">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{job.time_slot}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
              {variant !== 'technician' && (
                <TableCell>
                  {job.technician_id ? (
                    <span className="text-sm">{technicianNames[job.technician_id] || 'Assigned'}</span>
                  ) : (
                    <span className="text-muted-foreground text-sm">Unassigned</span>
                  )}
                </TableCell>
              )}
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(job.created_at), 'MMM d, h:mm a')}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                  {variant === 'semiadmin' && job.status === 'unassigned' && onAssign && (
                    <Button size="sm" variant="default" onClick={() => onAssign(job.id)}>
                      Assign
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => handleView(job)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
