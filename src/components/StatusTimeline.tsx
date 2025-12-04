import { JobStatus, JOB_STATUS_ORDER, STATUS_LABELS } from '@/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StatusTimelineProps {
  currentStatus: JobStatus;
  orientation?: 'horizontal' | 'vertical';
}

export const StatusTimeline = ({ currentStatus, orientation = 'vertical' }: StatusTimelineProps) => {
  const currentIndex = JOB_STATUS_ORDER.indexOf(currentStatus);

  if (orientation === 'horizontal') {
    return (
      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1 min-w-max px-2 py-4">
          {JOB_STATUS_ORDER.map((status, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={status} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all',
                      isCompleted && 'bg-success text-success-foreground',
                      isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                      !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  <span
                    className={cn(
                      'text-[10px] mt-1 text-center w-16',
                      isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {STATUS_LABELS[status]}
                  </span>
                </div>
                {index < JOB_STATUS_ORDER.length - 1 && (
                  <div
                    className={cn(
                      'w-4 h-0.5 mx-1',
                      index < currentIndex ? 'bg-success' : 'bg-muted'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {JOB_STATUS_ORDER.map((status, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={status} className="flex gap-4 pb-6 last:pb-0">
            {/* Line and Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all',
                  isCompleted && 'bg-success text-success-foreground',
                  isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20 animate-pulse-ring',
                  !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : index + 1}
              </div>
              {index < JOB_STATUS_ORDER.length - 1 && (
                <div
                  className={cn(
                    'w-0.5 flex-1 mt-2',
                    index < currentIndex ? 'bg-success' : 'bg-muted'
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-2">
              <p
                className={cn(
                  'font-medium',
                  isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {STATUS_LABELS[status]}
              </p>
              {isCurrent && (
                <p className="text-sm text-muted-foreground mt-1">Current step</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
