export type Role = 'student' | 'tutor' | 'admin';

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  major?: string;
  needs?: string[];
  expertise?: string[];
  availability?: string[];
  rating?: number;
  avatar?: string;
};

export type SessionStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export type Session = {
  id: number;
  studentId: number;
  tutorId: number;
  date: string;
  start: string;
  end: string;
  type: 'Online' | 'In-person';
  location?: string;
  status: SessionStatus;
  notes?: string;
  summary?: string;
};

export type Feedback = {
  sessionId: number;
  rating: number;
  comment: string;
  submittedAt: string;
};

export type TutorRequest = {
  id: string;
  studentId: number;
  tutorId: number;
  message: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
};

export type ResourceItem = {
  id: string;
  title: string;
  url: string;
  description: string;
  tags: string[];
};
