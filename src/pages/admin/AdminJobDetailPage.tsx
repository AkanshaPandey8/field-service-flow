import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { useJobs } from '@/hooks/useJobs';
import { StatusTimeline } from '@/components/StatusTimeline';
import { QCForm } from '@/components/QCForm';
import { Invoice } from '@/components/Invoice';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
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
import { Database } from '@/integrations/supabase/types';
import { QCData, Timeline } from '@/types';

type Job = Database['public']['Tables']['jobs']['Row'];

const AdminJobDetailPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { getJobById, loading } = useJobs();
  const [technicianName, setTechnicianName] = useState<string | null>(null);

  const job = getJobById(jobId || '');

  useEffect(() => {
    const fetchTechnicianName = async () => {
      if (job?.technician_id) {
        const { data } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', job.technician_id)
          .single();
        if (data) {
          setTechnicianName(data.name);
        }
      }
    };
    fetchTechnicianName();
  }, [job?.technician_id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-32" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-32" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

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

  const qcBefore = job.qc_before as unknown as QCData | null;
  const qcAfter = job.qc_after as unknown as QCData | null;
  const timeline = (job.timeline || {}) as unknown as Timeline;

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
              <h1 className="text-2xl font-bold text-foreground">
                {job.id.slice(0, 8).toUpperCase()}
              </h1>
              <StatusBadge status={job.status} />
            </div>
            <p className="text-muted-foreground">{job.device_type} - {job.device_issue}</p>
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
                    <p className="font-medium">{job.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{job.customer_phone}</p>
                  </div>
                  {job.customer_alt_phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Alt Phone</p>
                      <p className="font-medium">{job.customer_alt_phone}</p>
                    </div>
                  )}
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{job.customer_address}</p>
                  {job.customer_location && (
                    <a
                      href={job.customer_location}
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
                    <p className="font-medium">{job.device_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Issue</p>
                    <p className="font-medium">{job.device_issue}</p>
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
            {qcBefore && (
              <QCForm title="QC Report - Before Job" initialData={qcBefore} onSubmit={() => {}} readOnly />
            )}
            {qcAfter && (
              <QCForm title="QC Report - After Job" initialData={qcAfter} onSubmit={() => {}} readOnly />
            )}

            {/* Invoice */}
            {['invoice', 'payment', 'completed'].includes(job.status) && (
              <Invoice 
                job={{
                  jobId: job.id,
                  customer: {
                    name: job.customer_name,
                    phone: job.customer_phone,
                    altPhone: job.customer_alt_phone || '',
                    address: job.customer_address,
                    googleLocation: job.customer_location || '',
                  },
                  device: {
                    type: job.device_type,
                    issue: job.device_issue,
                  },
                  technician: null,
                  financials: {
                    serviceCharge: job.service_charge || 0,
                    partsCost: job.parts_cost || 0,
                    gst: job.gst || 0,
                    total: job.total || 0,
                  },
                  status: job.status,
                  timeline: timeline,
                  qcBefore: qcBefore,
                  qcAfter: qcAfter,
                  timeSlot: job.time_slot || '',
                  notes: job.notes || '',
                  paymentMethod: job.payment_method as any,
                  createdAt: job.created_at,
                }} 
              />
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
                {job.technician_id ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{technicianName || 'Loading...'}</p>
                      <p className="text-sm text-muted-foreground">Technician</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No technician assigned</p>
                )}
                <Separator />
                {job.time_slot && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{job.time_slot}</span>
                  </div>
                )}
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

            {/* Financials Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Financials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service Charge</span>
                  <span>₹{job.service_charge || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Parts Cost</span>
                  <span>₹{job.parts_cost || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST (18%)</span>
                  <span>₹{job.gst || 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>₹{job.total || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminJobDetailPage;