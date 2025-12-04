export type JobStatus =
  | 'assigned'
  | 'accepted'
  | 'waiting'
  | 'en_route'
  | 'doorstep'
  | 'qc_before'
  | 'job_started'
  | 'qc_after'
  | 'invoice'
  | 'payment'
  | 'completed';

export type UserRole = 'admin' | 'technician';

export interface QCData {
  display: 'ok' | 'not_ok' | null;
  frontCamera: 'ok' | 'not_ok' | null;
  backCamera: 'ok' | 'not_ok' | null;
  faceId: 'ok' | 'not_ok' | null;
  earSpeaker: 'ok' | 'not_ok' | null;
  microphone: 'ok' | 'not_ok' | null;
  downSpeaker: 'ok' | 'not_ok' | null;
  vibrator: 'ok' | 'not_ok' | null;
  volumeButton: 'ok' | 'not_ok' | null;
  powerButton: 'ok' | 'not_ok' | null;
  charging: 'ok' | 'not_ok' | null;
  imei: string;
  model: string;
  comments: string;
}

export interface Customer {
  name: string;
  phone: string;
  altPhone: string;
  address: string;
  googleLocation: string;
}

export interface Device {
  type: string;
  issue: string;
}

export interface Technician {
  techId: string;
  name: string;
  status: 'busy' | 'idle' | 'waiting_for_parts';
}

export interface Financials {
  serviceCharge: number;
  partsCost: number;
  gst: number;
  total: number;
}

export interface Timeline {
  assignedAt: string | null;
  acceptedAt: string | null;
  waitingAt: string | null;
  enRouteAt: string | null;
  doorstepAt: string | null;
  qcBeforeAt: string | null;
  jobStartAt: string | null;
  jobEndAt: string | null;
  qcAfterAt: string | null;
  invoiceAt: string | null;
  paymentAt: string | null;
  completedAt: string | null;
}

export interface Job {
  jobId: string;
  customer: Customer;
  device: Device;
  technician: Technician | null;
  financials: Financials;
  status: JobStatus;
  timeline: Timeline;
  qcBefore: QCData | null;
  qcAfter: QCData | null;
  timeSlot: string;
  notes: string;
  paymentMethod: 'cash' | 'upi' | 'card' | 'qr' | null;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export const JOB_STATUS_ORDER: JobStatus[] = [
  'assigned',
  'accepted',
  'waiting',
  'en_route',
  'doorstep',
  'qc_before',
  'job_started',
  'qc_after',
  'invoice',
  'payment',
  'completed',
];

export const STATUS_LABELS: Record<JobStatus, string> = {
  assigned: 'Assigned',
  accepted: 'Accepted',
  waiting: 'Waiting',
  en_route: 'En Route',
  doorstep: 'At Doorstep',
  qc_before: 'QC Before',
  job_started: 'Job In Progress',
  qc_after: 'QC After',
  invoice: 'Invoice',
  payment: 'Payment',
  completed: 'Completed',
};

export const TIME_SLOTS = [
  '9:00–10:00 AM',
  '10:00–11:00 AM',
  '11:00–12:00 PM',
  '12:00–1:00 PM',
  '1:00–2:00 PM',
  '2:00–3:00 PM',
  '3:00–4:00 PM',
  '4:00–5:00 PM',
  '5:00–6:00 PM',
  '6:00–7:00 PM',
];

export const DEVICE_TYPES = [
  'iPhone',
  'Samsung',
  'OnePlus',
  'Xiaomi',
  'Oppo',
  'Vivo',
  'Realme',
  'MacBook',
  'Dell Laptop',
  'HP Laptop',
  'Lenovo Laptop',
  'iPad',
  'Android Tablet',
];

export const ISSUE_TYPES = [
  'Screen Replacement',
  'Battery Replacement',
  'Charging Port Issue',
  'Camera Repair',
  'Speaker Issue',
  'Software Issue',
  'Water Damage',
  'Back Panel Replacement',
  'Button Repair',
  'General Diagnosis',
];
