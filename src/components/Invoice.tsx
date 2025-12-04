import { Job } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { FileText, Download } from 'lucide-react';

interface InvoiceProps {
  job: Job;
  onProceed?: () => void;
}

export const Invoice = ({ job, onProceed }: InvoiceProps) => {
  const handleGeneratePDF = () => {
    // Stub: Generate PDF
    alert('PDF generation stub - would generate invoice PDF');
  };

  return (
    <Card className="bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice
          </CardTitle>
          <span className="text-sm text-muted-foreground">#{job.jobId}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Customer Info */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Bill To</h4>
          <p className="font-medium">{job.customer.name}</p>
          <p className="text-sm text-muted-foreground">{job.customer.address}</p>
          <p className="text-sm text-muted-foreground">{job.customer.phone}</p>
        </div>

        <Separator />

        {/* Service Details */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Service Details</h4>
          <div className="flex justify-between">
            <span>Device</span>
            <span className="font-medium">{job.device.type}</span>
          </div>
          <div className="flex justify-between">
            <span>Issue</span>
            <span className="font-medium">{job.device.issue}</span>
          </div>
          <div className="flex justify-between">
            <span>Technician</span>
            <span className="font-medium">{job.technician?.name || 'N/A'}</span>
          </div>
        </div>

        <Separator />

        {/* Charges */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Charges</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Service Charge</span>
              <span>₹{job.financials.serviceCharge.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Parts Cost</span>
              <span>₹{job.financials.partsCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>GST (18%)</span>
              <span>₹{job.financials.gst.toLocaleString()}</span>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">₹{job.financials.total.toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={handleGeneratePDF} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          {onProceed && (
            <Button onClick={onProceed} className="flex-1">
              Proceed to Payment
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
