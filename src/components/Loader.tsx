import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  text?: string;
}

const sizeStyles = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export const Loader = ({ size = 'md', fullScreen = false, text }: LoaderProps) => {
  const loader = (
    <div className="flex flex-col items-center gap-3">
      <Loader2 className={cn('animate-spin text-primary', sizeStyles[size])} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        {loader}
      </div>
    );
  }

  return loader;
};
