import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { useJobs } from '@/context/JobsContext';
import { StatusTimeline } from '@/components/StatusTimeline';
import { QCForm } from '@/components/QCForm';
import { Invoice } from '@/components/Invoice';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Phone,
  MapPin,
  Smartphone,
  Clock,
  Wrench,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

const AdminJobDetailPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { getJob } = useJobs();

  const job = getJob(jobId || '');

  if (!job) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Job not found</p>
          <Button onClick={() => navigate('/admin')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{job.jobId}</h1>
              <StatusBadge status={job.status} />
            </div>
            <p className="text-muted-foreground">{job.device.type} - {job.device.issue}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{job.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{job.customer.phone}</p>
                  </div>
                  {job.customer.altPhone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Alt Phone</p>
                      <p className="font-medium">{job.customer.altPhone}</p>
                    </div>
                  )}
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{job.customer.address}</p>
                  {job.customer.googleLocation && (
                    <a
                      href={job.customer.googleLocation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1"
                    >
                      Open in Maps <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Device Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Device Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Device</p>
                    <p className="font-medium">{job.device.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Issue</p>
                    <p className="font-medium">{job.device.issue}</p>
                  </div>
                </div>
                {job.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p>{job.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* QC Reports */}
            {job.qcBefore && (
              <QCForm title="QC Report - Before Job" initialData={job.qcBefore} onSubmit={() => {}} readOnly />
            )}
            {job.qcAfter && (
              <QCForm title="QC Report - After Job" initialData={job.qcAfter} onSubmit={() => {}} readOnly />
            )}

            {/* Invoice */}
            {['invoice', 'payment', 'completed'].includes(job.status) && (
              <Invoice job={job} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assignment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {job.technician ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{job.technician.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {job.technician.status.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No technician assigned</p>
                )}
                <Separator />
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{job.timeSlot}</span>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Status Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <StatusTimeline currentStatus={job.status} orientation="vertical" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminJobDetailPage;
