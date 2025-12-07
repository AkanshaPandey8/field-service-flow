import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TechnicianLayout } from '@/layouts/TechnicianLayout';
import { useJobs } from '@/hooks/useJobs';
import { supabase } from '@/integrations/supabase/client';
import { StatusTimeline } from '@/components/StatusTimeline';
import { QCForm } from '@/components/QCForm';
import { Timer } from '@/components/Timer';
import { MapPreview } from '@/components/MapPreview';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { QCData, STATUS_LABELS } from '@/types';
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
  ArrowLeft,
  FileText,
} from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Job = Database['public']['Tables']['jobs']['Row'];

const JobWorkflowPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { jobs, loading, refetch } = useJobs();
  
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const job = jobs.find(j => j.id === jobId);

  const updateStatus = async (newStatus: string) => {
    if (!job) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase.functions.invoke('update-status', {
        body: { job_id: job.id, status: newStatus }
      });
      
      if (error) throw error;
      await refetch();
      toast.success(`Status updated to ${STATUS_LABELS[newStatus as keyof typeof STATUS_LABELS]}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
      setConfirmAction(null);
    }
  };

  const handleAccept = () => setConfirmAction('accept');
  const handleWait = () => updateStatus('waiting');
  const handleLeave = () => setConfirmAction('leave');
  const handleReachDoorstep = () => setConfirmAction('doorstep');
  const handleStartJob = () => setConfirmAction('start');
  const handleEndJob = () => setConfirmAction('end');

  const handleQCBeforeSubmit = async (data: QCData) => {
    if (!job) return;
    setIsUpdating(true);
    try {
      const { error } = await supabase.functions.invoke('update-status', {
        body: { 
          job_id: job.id, 
          status: 'qc_before',
          qc_data: {
            fields: data,
            customer_signature: data.customerSignature,
            submitted_at: new Date().toISOString()
          }
        }
      });
      if (error) throw error;
      await refetch();
      toast.success('QC Before submitted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit QC');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQCAfterSubmit = async (data: QCData) => {
    if (!job) return;
    setIsUpdating(true);
    try {
      const { error } = await supabase.functions.invoke('update-status', {
        body: { 
          job_id: job.id, 
          status: 'qc_after',
          qc_data: {
            fields: data,
            customer_signature: data.customerSignature,
            submitted_at: new Date().toISOString()
          }
        }
      });
      if (error) throw error;
      await refetch();
      toast.success('QC After submitted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit QC');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProceedToPayment = () => updateStatus('payment');
  
  const handlePayment = async (method: string) => {
    if (!job) return;
    setIsUpdating(true);
    try {
      const { error } = await supabase.functions.invoke('update-status', {
        body: { 
          job_id: job.id, 
          status: 'completed',
          payment_method: method
        }
      });
      if (error) throw error;
      await refetch();
      toast.success('Payment completed!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete payment');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <TechnicianLayout>
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </TechnicianLayout>
    );
  }

  if (!job) {
    return (
      <TechnicianLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Job not found</p>
          <Button onClick={() => navigate('/tech')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </TechnicianLayout>
    );
  }

  const timeline = (job.timeline as Record<string, string>) || {};

  // Render action based on status
  const renderAction = () => {
    switch (job.status) {
      case 'assigned':
        return (
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">New Job Assigned</h3>
                  <p className="text-sm text-muted-foreground">Review the details and accept this job</p>
                </div>
                <Button onClick={handleAccept} size="lg" className="w-full" disabled={isUpdating}>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Accept Job
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'accepted':
        return (
          <div className="space-y-3">
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="p-4">
                <p className="text-sm text-center text-muted-foreground">
                  Choose your next action. Make sure you have all required parts.
                </p>
              </CardContent>
            </Card>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleWait} variant="outline" size="lg" disabled={isUpdating}>
                <Clock className="h-5 w-5 mr-2" />
                Wait for Parts
              </Button>
              <Button onClick={handleLeave} size="lg" disabled={isUpdating}>
                <ArrowRight className="h-5 w-5 mr-2" />
                Leave Now
              </Button>
            </div>
          </div>
        );

      case 'waiting':
        return (
          <div className="space-y-4">
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Package className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">Waiting for Parts</p>
                  <p className="text-sm text-muted-foreground">Ready to leave when parts are collected</p>
                </div>
              </CardContent>
            </Card>
            <Button onClick={handleLeave} size="lg" className="w-full" disabled={isUpdating}>
              <ArrowRight className="h-5 w-5 mr-2" />
              Leave Now
            </Button>
          </div>
        );

      case 'en_route':
        return (
          <div className="space-y-4">
            <MapPreview address={job.customer_address} googleLocation={job.customer_location || ''} />
            <Card className="border-cyan-500/20 bg-cyan-500/5">
              <CardContent className="p-4">
                <p className="text-sm text-center text-muted-foreground">
                  Only mark as reached when you are physically at the customer's location
                </p>
              </CardContent>
            </Card>
            <Button onClick={handleReachDoorstep} size="lg" className="w-full" disabled={isUpdating}>
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
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">QC Before Complete</p>
                  <p className="text-sm text-muted-foreground">Ready to start the repair</p>
                </div>
              </CardContent>
            </Card>
            <Button onClick={handleStartJob} size="lg" className="w-full" disabled={isUpdating}>
              <Smartphone className="h-5 w-5 mr-2" />
              Start Job
            </Button>
          </div>
        );

      case 'job_started':
        return (
          <Timer
            startTime={timeline.job_started}
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
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Invoice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Service Charge</p>
                    <p className="font-medium">₹{job.service_charge || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Parts Cost</p>
                    <p className="font-medium">₹{job.parts_cost || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">GST</p>
                    <p className="font-medium">₹{job.gst || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-bold text-lg text-primary">₹{job.total || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Button onClick={handleProceedToPayment} size="lg" className="w-full" disabled={isUpdating}>
              Proceed to Payment
            </Button>
          </div>
        );

      case 'payment':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Collect Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-muted-foreground">Amount to Collect</p>
                <p className="text-3xl font-bold text-primary">₹{job.total || 0}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {['cash', 'upi', 'card', 'qr'].map(method => (
                  <Button 
                    key={method} 
                    variant="outline" 
                    className="h-16 text-lg capitalize"
                    onClick={() => handlePayment(method)}
                    disabled={isUpdating}
                  >
                    {method === 'qr' ? 'QR Code' : method.toUpperCase()}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'completed':
        return (
          <div className="space-y-6">
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Job Completed!</h3>
                <p className="text-muted-foreground">Payment received successfully</p>
              </CardContent>
            </Card>
            <Button onClick={() => navigate('/tech')} size="lg" className="w-full" variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
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
        {/* Back Button */}
        <Button variant="ghost" size="sm" onClick={() => navigate('/tech')} className="-ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        {/* Job Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-mono">
              {job.id.slice(0, 8).toUpperCase()}
            </p>
            <h1 className="text-xl font-bold text-foreground">{job.device_type}</h1>
            <p className="text-muted-foreground">{job.device_issue}</p>
          </div>
          <StatusBadge status={job.status} />
        </div>

        {/* Customer Details - Full Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-medium">{job.customer_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <a href={`tel:${job.customer_phone}`} className="font-medium text-primary hover:underline">
                    {job.customer_phone}
                  </a>
                </div>
              </div>
            </div>
            
            {job.customer_alt_phone && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Alt Phone</p>
                  <a href={`tel:${job.customer_alt_phone}`} className="font-medium text-primary hover:underline">
                    {job.customer_alt_phone}
                  </a>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="font-medium">{job.customer_address}</p>
                {job.customer_location && (
                  <p className="text-sm text-muted-foreground mt-1">{job.customer_location}</p>
                )}
              </div>
            </div>
            
            {job.time_slot && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Time Slot</p>
                  <p className="font-medium">{job.time_slot}</p>
                </div>
              </div>
            )}
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
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Important Notes</p>
                  <p className="text-sm text-muted-foreground mt-1">{job.notes}</p>
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

        {/* Confirmation Dialogs */}
        <AlertDialog open={confirmAction === 'accept'} onOpenChange={() => setConfirmAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Accept this job?</AlertDialogTitle>
              <AlertDialogDescription>
                By accepting, you confirm that you can complete this repair job for {job.customer_name}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => updateStatus('accepted')} disabled={isUpdating}>
                Yes, Accept Job
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={confirmAction === 'leave'} onOpenChange={() => setConfirmAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ready to leave?</AlertDialogTitle>
              <AlertDialogDescription>
                Make sure you have all required parts and tools before leaving for the job.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg my-4">
              <Package className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">Have you collected all required parts?</span>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => updateStatus('en_route')} disabled={isUpdating}>
                Yes, Leave Now
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={confirmAction === 'doorstep'} onOpenChange={() => setConfirmAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm arrival</AlertDialogTitle>
              <AlertDialogDescription>
                Are you physically at {job.customer_address}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Not yet</AlertDialogCancel>
              <AlertDialogAction onClick={() => updateStatus('doorstep')} disabled={isUpdating}>
                Yes, I'm here
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={confirmAction === 'start'} onOpenChange={() => setConfirmAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Start the repair?</AlertDialogTitle>
              <AlertDialogDescription>
                This will start the job timer. Make sure the QC check is complete and you're ready to begin the repair.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => updateStatus('job_started')} disabled={isUpdating}>
                Start Job
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={confirmAction === 'end'} onOpenChange={() => setConfirmAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>End the repair?</AlertDialogTitle>
              <AlertDialogDescription>
                Make sure the repair is fully complete before ending. You'll need to perform a final QC check.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continue Working</AlertDialogCancel>
              <AlertDialogAction onClick={() => updateStatus('qc_after')} disabled={isUpdating}>
                End Job
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TechnicianLayout>
  );
};

export default JobWorkflowPage;
