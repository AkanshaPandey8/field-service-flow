import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from './ui/card';
import { Play, Pause, Clock } from 'lucide-react';
import { Button } from './ui/button';

interface TimerProps {
  startTime?: string | null;
  onEnd?: () => void;
  isRunning?: boolean;
}

export const Timer = ({ startTime, onEnd, isRunning = true }: TimerProps) => {
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (startTime) {
      const start = new Date(startTime).getTime();
      const now = Date.now();
      setElapsed(Math.floor((now - start) / 1000));
    }
  }, [startTime]);

  useEffect(() => {
    if (!isRunning || isPaused) return;

    const interval = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  const formatTime = useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, []);

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-5 w-5" />
            <span className="font-medium">Job Timer</span>
          </div>
          
          <div className="text-5xl font-bold font-mono text-primary tracking-wider">
            {formatTime(elapsed)}
          </div>

          {isRunning && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </>
                )}
              </Button>
              {onEnd && (
                <Button size="sm" onClick={onEnd}>
                  End Job
                </Button>
              )}
            </div>
          )}

          {!isRunning && (
            <p className="text-sm text-muted-foreground">
              Total time: {formatTime(elapsed)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
