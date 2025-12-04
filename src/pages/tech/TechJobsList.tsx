import { TechnicianLayout } from '@/layouts/TechnicianLayout';
import { useJobs } from '@/context/JobsContext';
import { useAuth } from '@/context/AuthContext';
import { JobCard } from '@/components/JobCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';

const TechJobsList = () => {
  const { jobs } = useJobs();
  const { user } = useAuth();

  // Filter jobs for this technician (using tech-1 as default for demo)
  const techJobs = useMemo(() => {
    return jobs.filter(job => job.technician?.techId === 'tech-1');
  }, [jobs]);

  const activeJobs = techJobs.filter(job => job.status !== 'completed');
  const completedJobs = techJobs.filter(job => job.status === 'completed');

  return (
    <TechnicianLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Jobs</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active" className="gap-2">
              Active
              <Badge variant="secondary">{activeJobs.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              Completed
              <Badge variant="secondary">{completedJobs.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {activeJobs.length > 0 ? (
              <div className="space-y-4">
                {activeJobs.map(job => (
                  <JobCard key={job.jobId} job={job} variant="technician" />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No active jobs</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {completedJobs.length > 0 ? (
              <div className="space-y-4">
                {completedJobs.map(job => (
                  <JobCard key={job.jobId} job={job} variant="technician" />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No completed jobs</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </TechnicianLayout>
  );
};

export default TechJobsList;
