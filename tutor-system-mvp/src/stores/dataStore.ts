import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { feedback as feedbackSeed, resources, sessions as sessionSeed, students, tutorRequests as requestSeed, tutors } from '../data/mockData';
import { Feedback, ResourceItem, Session, TutorRequest, User } from '../types';

export type DataState = {
  students: User[];
  tutors: User[];
  sessions: Session[];
  feedback: Feedback[];
  tutorRequests: TutorRequest[];
  resources: ResourceItem[];
  upsertStudent: (student: User) => void;
  upsertTutor: (tutor: User) => void;
  addSession: (session: Omit<Session, 'id'>) => Session;
  updateSessionStatus: (sessionId: number, status: Session['status']) => void;
  cancelSession: (sessionId: number) => void;
  addFeedback: (item: Feedback) => void;
  addTutorRequest: (payload: Omit<TutorRequest, 'id' | 'status' | 'createdAt'>) => TutorRequest;
  updateTutorRequest: (id: string, status: TutorRequest['status']) => void;
  appendSummary: (sessionId: number, summary: string) => void;
};

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      students,
      tutors,
      sessions: sessionSeed,
      feedback: feedbackSeed,
      tutorRequests: requestSeed,
      resources,
      upsertStudent(student) {
        set((state) => ({
          students: state.students.map((s) => (s.id === student.id ? { ...s, ...student } : s)),
        }));
      },
      upsertTutor(tutor) {
        set((state) => ({
          tutors: state.tutors.map((t) => (t.id === tutor.id ? { ...t, ...tutor } : t)),
        }));
      },
      addSession(session) {
        const nextId = Math.max(0, ...get().sessions.map((s) => s.id)) + 1;
        const newSession: Session = { id: nextId, ...session };
        set((state) => ({ sessions: [...state.sessions, newSession] }));
        return newSession;
      },
      updateSessionStatus(sessionId, status) {
        set((state) => ({
          sessions: state.sessions.map((s) => (s.id === sessionId ? { ...s, status } : s)),
        }));
      },
      cancelSession(sessionId) {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, status: 'Cancelled' as const } : s
          ),
        }));
      },
      addFeedback(item) {
        const existing = get().feedback.find((f) => f.sessionId === item.sessionId);
        if (existing) {
          set((state) => ({
            feedback: state.feedback.map((f) => (f.sessionId === item.sessionId ? item : f)),
          }));
        } else {
          set((state) => ({ feedback: [...state.feedback, item] }));
        }
      },
      addTutorRequest(payload) {
        const newRequest: TutorRequest = {
          id: nanoid(),
          status: 'Pending',
          createdAt: new Date().toISOString(),
          ...payload,
        };
        set((state) => ({ tutorRequests: [...state.tutorRequests, newRequest] }));
        return newRequest;
      },
      updateTutorRequest(id, status) {
        set((state) => ({
          tutorRequests: state.tutorRequests.map((request) =>
            request.id === id ? { ...request, status } : request
          ),
        }));
      },
      appendSummary(sessionId, summary) {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId ? { ...session, summary } : session
          ),
        }));
      },
    }),
    {
      name: 'tss-data',
    }
  )
);
