import { StatusBadge } from './ui/StatusBadge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Phone, Clock, User, Wrench, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { JobStatus } from '@/types';

interface DbJob {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  device_type: string;
  device_issue: string;
  status: JobStatus;
  time_slot: string | null;
  technician_id: string | null;
}

interface JobCardProps {
  job: DbJob;
  variant?: 'admin' | 'technician';
  compact?: boolean;
  technicianName?: string;
}

export const JobCard = ({ job, variant = 'admin', compact = false, technicianName }: JobCardProps) => {
  const navigate = useNavigate();

  const handleView = () => {
    if (variant === 'admin') {
      navigate(`/admin/jobs/${job.id}`);
    } else {
      navigate(`/tech/jobs/${job.id}`);
    }
  };

  const handleCall = () => {
    window.location.href = `tel:${job.customer_phone}`;
  };

  if (compact) {
    return (
      <Card className="bg-card hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary">
        <CardContent className="p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{job.device_type}</p>
              <p className="text-xs text-muted-foreground truncate">{job.customer_name}</p>
            </div>
            <StatusBadge status={job.status} size="sm" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-foreground">{job.device_type}</p>
              <p className="text-sm text-muted-foreground">{job.device_issue}</p>
            </div>
            <StatusBadge status={job.status} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{job.customer_name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{job.customer_phone}</span>
            </div>
            {job.time_slot && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{job.time_slot}</span>
              </div>
            )}
            {technicianName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wrench className="h-4 w-4" />
                <span>{technicianName}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            {variant === 'technician' && (
              <Button variant="outline" size="sm" onClick={handleCall} className="flex-1">
                <Phone className="h-4 w-4 mr-1" />
                Call
              </Button>
            )}
            <Button size="sm" onClick={handleView} className="flex-1">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
