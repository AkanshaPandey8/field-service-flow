import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { STATUS_LABELS, JOB_STATUS_ORDER, JobStatus } from '@/types';
import { Database } from '@/integrations/supabase/types';

type Job = Database['public']['Tables']['jobs']['Row'];

interface StatusCountBarProps {
  jobs: Job[];
}

const STATUS_COLORS: Record<JobStatus, string> = {
  unassigned: 'bg-muted text-muted-foreground',
  assigned: 'bg-blue-500 text-white',
  accepted: 'bg-violet-500 text-white',
  waiting: 'bg-amber-500 text-white',
  en_route: 'bg-cyan-500 text-white',
  doorstep: 'bg-purple-500 text-white',
  qc_before: 'bg-pink-500 text-white',
  job_started: 'bg-orange-500 text-white',
  qc_after: 'bg-pink-500 text-white',
  invoice: 'bg-teal-500 text-white',
  payment: 'bg-emerald-500 text-white',
  completed: 'bg-green-600 text-white',
};

export const StatusCountBar = ({ jobs }: StatusCountBarProps) => {
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    JOB_STATUS_ORDER.forEach(status => {
      counts[status] = jobs.filter(job => job.status === status).length;
    });
    return counts;
  }, [jobs]);

  const activeStatuses = JOB_STATUS_ORDER.filter(status => statusCounts[status] > 0);

  return (
    <div className="flex flex-wrap gap-2">
      {activeStatuses.map(status => (
        <Badge
          key={status}
          className={`${STATUS_COLORS[status]} px-3 py-1.5 text-sm font-medium`}
        >
          {statusCounts[status]} {STATUS_LABELS[status]}
        </Badge>
      ))}
      {activeStatuses.length === 0 && (
        <span className="text-sm text-muted-foreground">No jobs</span>
      )}
    </div>
  );
};
