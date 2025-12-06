import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { DEVICE_TYPES, ISSUE_TYPES, TIME_SLOTS } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { User, Phone, MapPin, Smartphone, AlertCircle, DollarSign, Clock, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const CreateJobPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    altPhone: '',
    address: '',
    googleLocation: '',
    deviceType: '',
    issueType: '',
    notes: '',
    serviceCharge: '',
    partsCost: '',
    timeSlot: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.phone || !formData.address || !formData.deviceType || !formData.issueType) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const serviceCharge = parseFloat(formData.serviceCharge) || 0;
      const partsCost = parseFloat(formData.partsCost) || 0;
      const gst = (serviceCharge + partsCost) * 0.18;

      const { data, error } = await supabase.functions.invoke('create-job', {
        body: {
          customerName: formData.customerName,
          customerPhone: formData.phone,
          customerAltPhone: formData.altPhone || null,
          customerAddress: formData.address,
          customerLocation: formData.googleLocation || null,
          deviceType: formData.deviceType,
          deviceIssue: formData.issueType,
          notes: formData.notes || null,
          timeSlot: formData.timeSlot || null,
          serviceCharge,
          partsCost,
          gst,
        },
      });

      if (error) throw error;

      toast.success('Job created successfully');
      navigate('/admin');
    } catch (error: any) {
      console.error('Error creating job:', error);
      toast.error(error.message || 'Failed to create job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create New Job</h1>
            <p className="text-muted-foreground">Fill in the details to create a new repair job</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => handleChange('customerName', e.target.value)}
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="altPhone">Alternate Phone</Label>
                <Input
                  id="altPhone"
                  value={formData.altPhone}
                  onChange={(e) => handleChange('altPhone', e.target.value)}
                  placeholder="Optional alternate number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Enter full address"
                    className="pl-10 min-h-[80px]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="googleLocation">Google Maps Link</Label>
                <Input
                  id="googleLocation"
                  value={formData.googleLocation}
                  onChange={(e) => handleChange('googleLocation', e.target.value)}
                  placeholder="https://maps.google.com/..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Device Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Smartphone className="h-5 w-5" />
                Device Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Device Type *</Label>
                  <Select value={formData.deviceType} onValueChange={(v) => handleChange('deviceType', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select device" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEVICE_TYPES.map(device => (
                        <SelectItem key={device} value={device}>{device}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Issue Type *</Label>
                  <Select value={formData.issueType} onValueChange={(v) => handleChange('issueType', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue" />
                    </SelectTrigger>
                    <SelectContent>
                      {ISSUE_TYPES.map(issue => (
                        <SelectItem key={issue} value={issue}>{issue}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <div className="relative">
                  <AlertCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Any additional notes..."
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charges & Time Slot */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5" />
                Charges & Scheduling
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceCharge">Service Charge (₹)</Label>
                  <Input
                    id="serviceCharge"
                    type="number"
                    value={formData.serviceCharge}
                    onChange={(e) => handleChange('serviceCharge', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partsCost">Parts Cost (₹)</Label>
                  <Input
                    id="partsCost"
                    type="number"
                    value={formData.partsCost}
                    onChange={(e) => handleChange('partsCost', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time Slot
                </Label>
                <RadioGroup
                  value={formData.timeSlot}
                  onValueChange={(v) => handleChange('timeSlot', v)}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2"
                >
                  {TIME_SLOTS.map(slot => (
                    <div key={slot}>
                      <RadioGroupItem value={slot} id={slot} className="peer sr-only" />
                      <Label
                        htmlFor={slot}
                        className={cn(
                          'flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer text-sm transition-all',
                          'hover:bg-muted/50',
                          'peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:font-medium'
                        )}
                      >
                        {slot}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Info Banner */}
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> This job will be created with status "Unassigned". 
              A semi-admin can then assign a technician to this job.
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/admin')} 
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Job'
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default CreateJobPage;