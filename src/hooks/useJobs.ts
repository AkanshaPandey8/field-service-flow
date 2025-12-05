import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Database } from '@/integrations/supabase/types';

type Job = Database['public']['Tables']['jobs']['Row'];
type JobStatus = Database['public']['Enums']['job_status'];

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, role } = useAuth();

  const fetchJobs = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase.from('jobs').select('*');

      // Technicians only see their own jobs
      if (role === 'technician') {
        query = query.eq('technician_id', user.id);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setJobs(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    // Set up realtime subscription
    const channel = supabase
      .channel('jobs-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
        },
        (payload) => {
          console.log('Realtime update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newJob = payload.new as Job;
            // Only add if technician and it's their job, or if admin/semiadmin/viewer
            if (role !== 'technician' || newJob.technician_id === user?.id) {
              setJobs((prev) => [newJob, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedJob = payload.new as Job;
            setJobs((prev) =>
              prev.map((job) => (job.id === updatedJob.id ? updatedJob : job))
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedJob = payload.old as Job;
            setJobs((prev) => prev.filter((job) => job.id !== deletedJob.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, role]);

  const getJobById = (jobId: string) => {
    return jobs.find((job) => job.id === jobId);
  };

  const getJobsByStatus = (status: JobStatus) => {
    return jobs.filter((job) => job.status === status);
  };

  return {
    jobs,
    loading,
    error,
    refetch: fetchJobs,
    getJobById,
    getJobsByStatus,
  };
}
