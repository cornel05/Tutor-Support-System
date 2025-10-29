import { useMemo } from 'react';
import { useDataStore } from '../stores/dataStore';
import { useAuthStore } from '../stores/authStore';
import { Session } from '../types';

export function useSessions() {
  const { sessions } = useDataStore();
  const { user } = useAuthStore();

  const upcoming = useMemo(() => filterSessions(sessions, user, ['Pending', 'Confirmed']), [sessions, user]);
  const past = useMemo(() => filterSessions(sessions, user, ['Completed', 'Cancelled']), [sessions, user]);

  return { upcoming, past };
}

function filterSessions(sessions: Session[], user: ReturnType<typeof useAuthStore>['user'], statuses: Session['status'][]) {
  if (!user) return [];
  return sessions
    .filter((session) =>
      (user.role === 'student' ? session.studentId === user.id : session.tutorId === user.id) &&
      statuses.includes(session.status)
    )
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
}
