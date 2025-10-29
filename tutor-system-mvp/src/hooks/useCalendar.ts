import { useMemo } from 'react';
import { useDataStore } from '../stores/dataStore';
import { useAuthStore } from '../stores/authStore';
import { format } from 'date-fns';

export function useCalendarSummaries() {
  const { sessions, feedback } = useDataStore();
  const { user } = useAuthStore();

  return useMemo(() => {
    if (!user) return [] as { label: string; value: string }[];
    return sessions
      .filter((session) =>
        user.role === 'student' ? session.studentId === user.id : session.tutorId === user.id
      )
      .map((session) => ({
        label: `${format(new Date(`${session.date}T${session.start}`), 'MMM d, HH:mm')} • ${session.status}`,
        value: feedback.find((item) => item.sessionId === session.id)?.comment ?? 'No feedback yet',
      }));
  }, [sessions, feedback, user]);
}
