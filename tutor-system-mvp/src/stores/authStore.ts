import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Role, User } from '../types';
import { students, tutors } from '../data/mockData';

const credentialsMap: Record<string, { password: string; role: Role }> = {
  'student1@hcmut.edu.vn': { password: 'pass123', role: 'student' },
  'tutor1@hcmut.edu.vn': { password: 'pass123', role: 'tutor' },
  'admin@hcmut.edu.vn': { password: 'pass123', role: 'admin' },
};

const admins: User[] = [
  {
    id: 100,
    name: 'System Admin',
    email: 'admin@hcmut.edu.vn',
    role: 'admin',
    avatar: 'https://i.pravatar.cc/150?img=30',
  },
];

const allUsers: User[] = [...students, ...tutors, ...admins];

export type AuthState = {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      async login(email, password) {
        const credential = credentialsMap[email];
        if (!credential || credential.password !== password) {
          throw new Error('Invalid credentials');
        }
        const matched = allUsers.find((u) => u.email === email && u.role === credential.role);
        if (!matched) {
          throw new Error('User not provisioned');
        }
        set({ user: matched });
        return matched;
      },
      logout() {
        set({ user: null });
      },
    }),
    {
      name: 'tss-auth',
    }
  )
);
