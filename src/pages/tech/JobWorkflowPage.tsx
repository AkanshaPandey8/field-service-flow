import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TechnicianLayout } from '@/layouts/TechnicianLayout';
import { useJobs } from '@/context/JobsContext';
import { StatusTimeline } from '@/components/StatusTimeline';
import { QCForm } from '@/components/QCForm';
import { Timer } from '@/components/Timer';
import { MapPreview } from '@/components/MapPreview';
import { Invoice } from '@/components/Invoice';
import { PaymentForm } from '@/components/PaymentForm';
import { Popup } from '@/components/Popup';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { QCData } from '@/types';
import {
  User,
  Phone,
  MapPin,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Clock,
  Package,
} from 'lucide-react';

const JobWorkflowPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { getJob, updateJobStatus, updateQCBefore, updateQCAfter, startJob, endJob, completePayment } = useJobs();
  
  const [showLeavePopup, setShowLeavePopup] = useState(false);

  const job = getJob(jobId || '');

  if (!job) {
    return (
      <TechnicianLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Job not found</p>
          <Button onClick={() => navigate('/tech')} className="mt-4">
            Back to Jobs
          </Button>
        </div>
      </TechnicianLayout>
    );
  }

  const handleAccept = () => {
    updateJobStatus(job.jobId, 'accepted');
    toast.success('Job accepted');
  };

  const handleWait = () => {
    updateJobStatus(job.jobId, 'waiting');
    toast.info('Status updated to waiting');
  };

  const handleLeaveConfirm = () => {
    updateJobStatus(job.jobId, 'en_route');
    toast.success('You are now en route');
  };

  const handleReachDoorstep = () => {
    updateJobStatus(job.jobId, 'doorstep');
    toast.success('Reached doorstep');
  };

  const handleQCBeforeSubmit = (data: QCData) => {
    updateQCBefore(job.jobId, data);
    toast.success('QC Before submitted');
  };

  const handleStartJob = () => {
    startJob(job.jobId);
    toast.success('Job started');
  };

  const handleEndJob = () => {
    endJob(job.jobId);
    toast.success('Job ended');
  };

  const handleQCAfterSubmit = (data: QCData) => {
    updateQCAfter(job.jobId, data);
    toast.success('QC After submitted');
  };

  const handleProceedToPayment = () => {
    updateJobStatus(job.jobId, 'payment');
  };

  const handlePayment = () => {
    completePayment(job.jobId);
    toast.success('Payment completed!');
  };

  // Render action based on status
  const renderAction = () => {
    switch (job.status) {
      case 'assigned':
        return (
          <Button onClick={handleAccept} size="lg" className="w-full">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Accept Job
          </Button>
        );

      case 'accepted':
        return (
          <div className="space-y-3">
            <Button onClick={handleWait} variant="outline" size="lg" className="w-full">
              <Clock className="h-5 w-5 mr-2" />
              Wait
            </Button>
            <Button onClick={() => setShowLeavePopup(true)} size="lg" className="w-full">
              <ArrowRight className="h-5 w-5 mr-2" />
              Leave for Job
            </Button>
          </div>
        );

      case 'waiting':
        return (
          <div className="space-y-4">
            <Card className="bg-warning/10 border-warning/20">
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="h-6 w-6 text-warning" />
                <div>
                  <p className="font-medium">Waiting for Action</p>
                  <p className="text-sm text-muted-foreground">Ready to leave when parts are collected</p>
                </div>
              </CardContent>
            </Card>
            <Button onClick={() => setShowLeavePopup(true)} size="lg" className="w-full">
              <ArrowRight className="h-5 w-5 mr-2" />
              Leave Now
            </Button>
          </div>
        );

      case 'en_route':
        return (
          <div className="space-y-4">
            <MapPreview address={job.customer.address} googleLocation={job.customer.googleLocation} />
            <Button onClick={handleReachDoorstep} size="lg" className="w-full">
              <MapPin className="h-5 w-5 mr-2" />
              I Have Reached Doorstep
            </Button>
          </div>
        );

      case 'doorstep':
        return (
          <QCForm
            title="QC Check - Before Job"
            onSubmit={handleQCBeforeSubmit}
          />
        );

      case 'qc_before':
        return (
          <div className="space-y-4">
            <Card className="bg-success/10 border-success/20">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-success" />
                <div>
                  <p className="font-medium">QC Before Complete</p>
                  <p className="text-sm text-muted-foreground">Ready to start the job</p>
                </div>
              </CardContent>
            </Card>
            <Button onClick={handleStartJob} size="lg" className="w-full">
              <Smartphone className="h-5 w-5 mr-2" />
              Start Job
            </Button>
          </div>
        );

      case 'job_started':
        return (
          <Timer
            startTime={job.timeline.jobStartAt}
            onEnd={handleEndJob}
            isRunning={true}
          />
        );

      case 'qc_after':
        return (
          <QCForm
            title="QC Check - After Job"
            onSubmit={handleQCAfterSubmit}
          />
        );

      case 'invoice':
        return (
          <Invoice job={job} onProceed={handleProceedToPayment} />
        );

      case 'payment':
        return (
          <PaymentForm job={job} onPayment={handlePayment} />
        );

      case 'completed':
        return (
          <div className="space-y-6">
            <Card className="bg-success/10 border-success/20">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Payment Successful!</h3>
                <p className="text-muted-foreground">Job completed successfully</p>
              </CardContent>
            </Card>
            <Button onClick={() => navigate('/tech')} size="lg" className="w-full">
              Back to Jobs
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <TechnicianLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Job Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{job.jobId}</p>
            <h1 className="text-xl font-bold text-foreground">{job.device.type}</h1>
            <p className="text-muted-foreground">{job.device.issue}</p>
          </div>
          <StatusBadge status={job.status} />
        </div>

        {/* Customer Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{job.customer.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${job.customer.phone}`} className="text-primary hover:underline">
                {job.customer.phone}
              </a>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="text-sm">{job.customer.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{job.timeSlot}</span>
            </div>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusTimeline currentStatus={job.status} orientation="horizontal" />
          </CardContent>
        </Card>

        {/* Notes */}
        {job.notes && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Notes</p>
                  <p className="text-sm text-muted-foreground">{job.notes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Action Area */}
        <div className="pb-4">
          {renderAction()}
        </div>

        {/* Leave Popup */}
        <Popup
          open={showLeavePopup}
          onOpenChange={setShowLeavePopup}
          title="Ready to Leave?"
          description="Make sure you have everything you need."
          confirmLabel="Yes, Proceed"
          cancelLabel="Cancel"
          onConfirm={handleLeaveConfirm}
        >
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Package className="h-5 w-5 text-muted-foreground" />
            <span>Have you collected all required parts?</span>
          </div>
        </Popup>
      </div>
    </TechnicianLayout>
  );
};

export default JobWorkflowPage;
