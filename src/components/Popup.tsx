import { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';

interface PopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  variant?: 'default' | 'destructive';
}

export const Popup = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
}: PopupProps) => {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        
        {children && <div className="py-4">{children}</div>}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel}>
            {cancelLabel}
          </Button>
          <Button
            onClick={handleConfirm}
            variant={variant === 'destructive' ? 'destructive' : 'default'}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
