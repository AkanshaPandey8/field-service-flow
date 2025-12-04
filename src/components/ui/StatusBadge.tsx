import { JobStatus, STATUS_LABELS } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: JobStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusStyles: Record<JobStatus, string> = {
  assigned: 'bg-blue-100 text-blue-800 border-blue-200',
  accepted: 'bg-violet-100 text-violet-800 border-violet-200',
  waiting: 'bg-amber-100 text-amber-800 border-amber-200',
  en_route: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  doorstep: 'bg-purple-100 text-purple-800 border-purple-200',
  qc_before: 'bg-pink-100 text-pink-800 border-pink-200',
  job_started: 'bg-orange-100 text-orange-800 border-orange-200',
  qc_after: 'bg-pink-100 text-pink-800 border-pink-200',
  invoice: 'bg-teal-100 text-teal-800 border-teal-200',
  payment: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export const StatusBadge = ({ status, size = 'md' }: StatusBadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        statusStyles[status],
        sizeStyles[size]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
};
