import { useRef, useEffect, useState } from 'react';
import SignaturePadLib from 'signature_pad';
import { Button } from '@/components/ui/button';
import { Undo2, Trash2 } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  value?: string;
  required?: boolean;
  label?: string;
}

export function SignaturePad({ onSave, value, required = true, label = "Customer Signature" }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePadLib | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (canvasRef.current) {
      signaturePadRef.current = new SignaturePadLib(canvasRef.current, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)',
      });

      signaturePadRef.current.addEventListener('endStroke', () => {
        setIsEmpty(signaturePadRef.current?.isEmpty() ?? true);
        if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
          onSave(signaturePadRef.current.toDataURL('image/png'));
        }
      });

      // Load existing signature if provided
      if (value) {
        const img = new Image();
        img.onload = () => {
          const ctx = canvasRef.current?.getContext('2d');
          if (ctx && canvasRef.current) {
            ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
            setIsEmpty(false);
          }
        };
        img.src = value;
      }

      // Handle resize
      const resizeCanvas = () => {
        if (canvasRef.current && signaturePadRef.current) {
          const ratio = Math.max(window.devicePixelRatio || 1, 1);
          const canvas = canvasRef.current;
          const rect = canvas.getBoundingClientRect();
          canvas.width = rect.width * ratio;
          canvas.height = rect.height * ratio;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.scale(ratio, ratio);
          }
          signaturePadRef.current.clear();
          setIsEmpty(true);
        }
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      return () => {
        window.removeEventListener('resize', resizeCanvas);
        signaturePadRef.current?.off();
      };
    }
  }, []);

  const handleClear = () => {
    signaturePadRef.current?.clear();
    setIsEmpty(true);
    onSave('');
  };

  const handleUndo = () => {
    if (signaturePadRef.current) {
      const data = signaturePadRef.current.toData();
      if (data.length > 0) {
        data.pop();
        signaturePadRef.current.fromData(data);
        setIsEmpty(signaturePadRef.current.isEmpty());
        if (signaturePadRef.current.isEmpty()) {
          onSave('');
        } else {
          onSave(signaturePadRef.current.toDataURL('image/png'));
        }
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUndo}
            className="h-8"
          >
            <Undo2 className="h-4 w-4 mr-1" />
            Undo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="h-8"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>
      <div className={`border-2 rounded-lg overflow-hidden ${isEmpty && required ? 'border-destructive/50' : 'border-border'}`}>
        <canvas
          ref={canvasRef}
          className="w-full h-40 touch-none cursor-crosshair"
          style={{ touchAction: 'none' }}
        />
      </div>
      {isEmpty && required && (
        <p className="text-xs text-destructive">Customer signature is required</p>
      )}
    </div>
  );
}
