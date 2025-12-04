import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { useJobs } from '@/context/JobsContext';
import { DEVICE_TYPES, ISSUE_TYPES, TIME_SLOTS, Technician } from '@/types';
import { mockTechnicians } from '@/data/mockData';
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
import { User, Phone, MapPin, Smartphone, AlertCircle, DollarSign, Clock, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

const CreateJobPage = () => {
  const { createJob } = useJobs();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    altPhone: '',
    address: '',
    googleLocation: '',
    deviceType: '',
    issueType: '',
    notes: '',
    amountToCollect: '',
    technicianId: '',
    timeSlot: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.phone || !formData.deviceType || !formData.issueType || !formData.technicianId || !formData.timeSlot) {
      toast.error('Please fill all required fields');
      return;
    }

    const selectedTech = mockTechnicians.find(t => t.techId === formData.technicianId);
    const amount = parseFloat(formData.amountToCollect) || 0;
    const gst = amount * 0.18;

    createJob({
      customer: {
        name: formData.customerName,
        phone: formData.phone,
        altPhone: formData.altPhone,
        address: formData.address,
        googleLocation: formData.googleLocation,
      },
      device: {
        type: formData.deviceType,
        issue: formData.issueType,
      },
      technician: selectedTech || null,
      financials: {
        serviceCharge: amount,
        partsCost: 0,
        gst: gst,
        total: amount + gst,
      },
      timeSlot: formData.timeSlot,
      notes: formData.notes,
    });

    toast.success('Job created successfully');
    navigate('/admin');
  };

  const getStatusBadge = (status: Technician['status']) => {
    const styles = {
      idle: 'bg-green-100 text-green-800',
      busy: 'bg-red-100 text-red-800',
      waiting_for_parts: 'bg-yellow-100 text-yellow-800',
    };
    const labels = {
      idle: 'Idle',
      busy: 'Busy',
      waiting_for_parts: 'Waiting for Parts',
    };
    return (
      <span className={cn('text-xs px-2 py-0.5 rounded-full', styles[status])}>
        {labels[status]}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Create New Job</h1>
          <p className="text-muted-foreground">Fill in the details to create a new repair job</p>
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

              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Collect (₹)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amountToCollect}
                    onChange={(e) => handleChange('amountToCollect', e.target.value)}
                    placeholder="0"
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wrench className="h-5 w-5" />
                Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Technician Selection */}
              <div className="space-y-3">
                <Label>Select Technician *</Label>
                <RadioGroup
                  value={formData.technicianId}
                  onValueChange={(v) => handleChange('technicianId', v)}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                >
                  {mockTechnicians.map(tech => (
                    <div key={tech.techId}>
                      <RadioGroupItem value={tech.techId} id={tech.techId} className="peer sr-only" />
                      <Label
                        htmlFor={tech.techId}
                        className={cn(
                          'flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all',
                          'hover:bg-muted/50',
                          'peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <User className="h-5 w-5" />
                          </div>
                          <span className="font-medium">{tech.name}</span>
                        </div>
                        {getStatusBadge(tech.status)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Time Slot */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time Slot *
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

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/admin')} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Job
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default CreateJobPage;
