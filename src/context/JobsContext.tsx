import React, { createContext, useContext, useState, useCallback } from 'react';
import { Job, JobStatus, QCData } from '@/types';
import { initialMockJobs, mockTechnicians } from '@/data/mockData';

interface JobsContextType {
  jobs: Job[];
  getJob: (jobId: string) => Job | undefined;
  createJob: (jobData: Partial<Job>) => Job;
  updateJobStatus: (jobId: string, status: JobStatus) => void;
  updateQCBefore: (jobId: string, qcData: QCData) => void;
  updateQCAfter: (jobId: string, qcData: QCData) => void;
  startJob: (jobId: string) => void;
  endJob: (jobId: string) => void;
  setPaymentMethod: (jobId: string, method: Job['paymentMethod']) => void;
  completePayment: (jobId: string) => void;
  getTechnicianJobs: (techId: string) => Job[];
}

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export const JobsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>(initialMockJobs);

  const getJob = useCallback((jobId: string) => {
    return jobs.find(j => j.jobId === jobId);
  }, [jobs]);

  const createJob = useCallback((jobData: Partial<Job>): Job => {
    const newJob: Job = {
      jobId: `JOB-${String(jobs.length + 1).padStart(3, '0')}`,
      customer: jobData.customer || {
        name: '',
        phone: '',
        altPhone: '',
        address: '',
        googleLocation: '',
      },
      device: jobData.device || { type: '', issue: '' },
      technician: jobData.technician || null,
      financials: jobData.financials || { serviceCharge: 0, partsCost: 0, gst: 0, total: 0 },
      status: 'assigned',
      timeline: {
        assignedAt: new Date().toISOString(),
        acceptedAt: null,
        waitingAt: null,
        enRouteAt: null,
        doorstepAt: null,
        qcBeforeAt: null,
        jobStartAt: null,
        jobEndAt: null,
        qcAfterAt: null,
        invoiceAt: null,
        paymentAt: null,
        completedAt: null,
      },
      qcBefore: null,
      qcAfter: null,
      timeSlot: jobData.timeSlot || '',
      notes: jobData.notes || '',
      paymentMethod: null,
      createdAt: new Date().toISOString(),
    };

    // TODO: Firestore create
    // await addDoc(collection(db, 'jobs'), newJob);

    setJobs(prev => [...prev, newJob]);
    return newJob;
  }, [jobs.length]);

  const updateJobStatus = useCallback((jobId: string, status: JobStatus) => {
    setJobs(prev => prev.map(job => {
      if (job.jobId !== jobId) return job;
      
      const timelineKey = {
        assigned: 'assignedAt',
        accepted: 'acceptedAt',
        waiting: 'waitingAt',
        en_route: 'enRouteAt',
        doorstep: 'doorstepAt',
        qc_before: 'qcBeforeAt',
        job_started: 'jobStartAt',
        qc_after: 'qcAfterAt',
        invoice: 'invoiceAt',
        payment: 'paymentAt',
        completed: 'completedAt',
      }[status] as keyof typeof job.timeline;

      // TODO: Firestore update
      // await updateDoc(doc(db, 'jobs', jobId), { status, [`timeline.${timelineKey}`]: new Date().toISOString() });

      return {
        ...job,
        status,
        timeline: {
          ...job.timeline,
          [timelineKey]: new Date().toISOString(),
        },
      };
    }));
  }, []);

  const updateQCBefore = useCallback((jobId: string, qcData: QCData) => {
    setJobs(prev => prev.map(job => {
      if (job.jobId !== jobId) return job;
      return {
        ...job,
        qcBefore: qcData,
        status: 'qc_before' as JobStatus,
        timeline: {
          ...job.timeline,
          qcBeforeAt: new Date().toISOString(),
        },
      };
    }));
  }, []);

  const updateQCAfter = useCallback((jobId: string, qcData: QCData) => {
    setJobs(prev => prev.map(job => {
      if (job.jobId !== jobId) return job;
      return {
        ...job,
        qcAfter: qcData,
        status: 'invoice' as JobStatus,
        timeline: {
          ...job.timeline,
          qcAfterAt: new Date().toISOString(),
          invoiceAt: new Date().toISOString(),
        },
      };
    }));
  }, []);

  const startJob = useCallback((jobId: string) => {
    updateJobStatus(jobId, 'job_started');
  }, [updateJobStatus]);

  const endJob = useCallback((jobId: string) => {
    setJobs(prev => prev.map(job => {
      if (job.jobId !== jobId) return job;
      return {
        ...job,
        status: 'qc_after' as JobStatus,
        timeline: {
          ...job.timeline,
          jobEndAt: new Date().toISOString(),
        },
      };
    }));
  }, []);

  const setPaymentMethod = useCallback((jobId: string, method: Job['paymentMethod']) => {
    setJobs(prev => prev.map(job => {
      if (job.jobId !== jobId) return job;
      return { ...job, paymentMethod: method };
    }));
  }, []);

  const completePayment = useCallback((jobId: string) => {
    setJobs(prev => prev.map(job => {
      if (job.jobId !== jobId) return job;
      return {
        ...job,
        status: 'completed' as JobStatus,
        timeline: {
          ...job.timeline,
          paymentAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
      };
    }));
  }, []);

  const getTechnicianJobs = useCallback((techId: string) => {
    return jobs.filter(job => job.technician?.techId === techId);
  }, [jobs]);

  return (
    <JobsContext.Provider value={{
      jobs,
      getJob,
      createJob,
      updateJobStatus,
      updateQCBefore,
      updateQCAfter,
      startJob,
      endJob,
      setPaymentMethod,
      completePayment,
      getTechnicianJobs,
    }}>
      {children}
    </JobsContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
};
