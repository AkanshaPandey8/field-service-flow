import { useState } from 'react';
import { Job } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { CreditCard, Banknote, QrCode, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentFormProps {
  job: Job;
  onPayment: (method: Job['paymentMethod']) => void;
}

const paymentMethods = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'upi', label: 'UPI', icon: Smartphone },
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'qr', label: 'QR Code', icon: QrCode },
] as const;

export const PaymentForm = ({ job, onPayment }: PaymentFormProps) => {
  const [selectedMethod, setSelectedMethod] = useState<Job['paymentMethod']>(job.paymentMethod || 'cash');

  const handlePayment = () => {
    if (selectedMethod) {
      onPayment(selectedMethod);
    }
  };

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Select Payment Method</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amount */}
        <div className="text-center p-4 bg-primary/5 rounded-lg">
          <p className="text-sm text-muted-foreground">Amount to Collect</p>
          <p className="text-3xl font-bold text-primary">₹{job.financials.total.toLocaleString()}</p>
        </div>

        {/* Payment Methods */}
        <RadioGroup
          value={selectedMethod || ''}
          onValueChange={(value) => setSelectedMethod(value as Job['paymentMethod'])}
          className="grid grid-cols-2 gap-4"
        >
          {paymentMethods.map(({ value, label, icon: Icon }) => (
            <div key={value}>
              <RadioGroupItem value={value} id={value} className="peer sr-only" />
              <Label
                htmlFor={value}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all',
                  'hover:bg-muted/50',
                  'peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5'
                )}
              >
                <Icon className="h-8 w-8" />
                <span className="font-medium">{label}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>

        {/* QR Code Placeholder */}
        {selectedMethod === 'qr' && (
          <div className="flex flex-col items-center p-4 bg-muted/30 rounded-lg">
            <div className="w-40 h-40 bg-foreground/5 rounded-lg flex items-center justify-center mb-2">
              <QrCode className="h-24 w-24 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Scan to pay ₹{job.financials.total.toLocaleString()}</p>
          </div>
        )}

        <Button onClick={handlePayment} className="w-full" size="lg" disabled={!selectedMethod}>
          Confirm Payment
        </Button>
      </CardContent>
    </Card>
  );
};
