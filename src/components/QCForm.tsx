import { useState } from 'react';
import { QCData } from '@/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface QCFormProps {
  title: string;
  initialData?: QCData | null;
  onSubmit: (data: QCData) => void;
  readOnly?: boolean;
}

const QC_FIELDS = [
  { key: 'display', label: 'Display' },
  { key: 'frontCamera', label: 'Front Camera' },
  { key: 'backCamera', label: 'Back Camera' },
  { key: 'faceId', label: 'Face ID' },
  { key: 'earSpeaker', label: 'Ear Speaker' },
  { key: 'microphone', label: 'Microphone' },
  { key: 'downSpeaker', label: 'Down Speaker' },
  { key: 'vibrator', label: 'Vibrator' },
  { key: 'volumeButton', label: 'Volume Button' },
  { key: 'powerButton', label: 'Power Button' },
  { key: 'charging', label: 'Charging' },
] as const;

const initialQCData: QCData = {
  display: null,
  frontCamera: null,
  backCamera: null,
  faceId: null,
  earSpeaker: null,
  microphone: null,
  downSpeaker: null,
  vibrator: null,
  volumeButton: null,
  powerButton: null,
  charging: null,
  imei: '',
  model: '',
  comments: '',
};

export const QCForm = ({ title, initialData, onSubmit, readOnly = false }: QCFormProps) => {
  const [formData, setFormData] = useState<QCData>(initialData || initialQCData);

  const handleToggle = (key: keyof QCData, value: 'ok' | 'not_ok') => {
    if (readOnly) return;
    setFormData(prev => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isValid = QC_FIELDS.every(f => formData[f.key] !== null) && formData.imei && formData.model;

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Toggle Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {QC_FIELDS.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <Label className="font-medium">{label}</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={readOnly}
                    onClick={() => handleToggle(key, 'ok')}
                    className={cn(
                      'transition-all',
                      formData[key] === 'ok' && 'bg-success text-success-foreground border-success hover:bg-success/90'
                    )}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    OK
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={readOnly}
                    onClick={() => handleToggle(key, 'not_ok')}
                    className={cn(
                      'transition-all',
                      formData[key] === 'not_ok' && 'bg-destructive text-destructive-foreground border-destructive hover:bg-destructive/90'
                    )}
                  >
                    <X className="h-4 w-4 mr-1" />
                    NOT OK
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Text Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="imei">IMEI Number *</Label>
              <Input
                id="imei"
                value={formData.imei}
                onChange={e => setFormData(prev => ({ ...prev, imei: e.target.value }))}
                placeholder="Enter IMEI"
                disabled={readOnly}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={e => setFormData(prev => ({ ...prev, model: e.target.value }))}
                placeholder="Enter device model"
                disabled={readOnly}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Comments</Label>
            <Textarea
              id="comments"
              value={formData.comments}
              onChange={e => setFormData(prev => ({ ...prev, comments: e.target.value }))}
              placeholder="Any additional notes..."
              rows={3}
              disabled={readOnly}
            />
          </div>

          {!readOnly && (
            <Button type="submit" className="w-full" disabled={!isValid}>
              Submit QC Form
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
