import { useMemo, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Dialog } from '../components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Calendar } from '../components/Calendar';
import { useSessions } from '../hooks/useSessions';
import { Session } from '../types';
import { Check, ClipboardList, MessageSquare, Video } from 'lucide-react';

function TutorDashboard() {
  const { user } = useAuthStore();
  const {
    tutors,
    upsertTutor,
    tutorRequests,
    updateTutorRequest,
    students,
    sessions,
    feedback,
    appendSummary,
    addSession,
  } = useDataStore();
  const { upcoming } = useSessions();
  const [noteDialog, setNoteDialog] = useState<Session | null>(null);
  const [summary, setSummary] = useState('');

  if (!user) return null;

  const tutorProfile = tutors.find((tutor) => tutor.id === user.id) ?? user;
  const myRequests = tutorRequests.filter((request) => request.tutorId === tutorProfile.id);
  const myStudents = students.filter((student) =>
    sessions.some((session) => session.tutorId === tutorProfile.id && session.studentId === student.id)
  );

  const tutorFeedback = feedback.filter((item) =>
    sessions.some((session) => session.id === item.sessionId && session.tutorId === tutorProfile.id)
  );

  const averageRating = tutorFeedback.length
    ? tutorFeedback.reduce((acc, item) => acc + item.rating, 0) / tutorFeedback.length
    : 0;

  const completionRate = useMemo(() => {
    const total = sessions.filter((session) => session.tutorId === tutorProfile.id).length;
    if (!total) return 0;
    const completed = sessions.filter(
      (session) => session.tutorId === tutorProfile.id && session.status === 'Completed'
    ).length;
    return Math.round((completed / total) * 100);
  }, [sessions, tutorProfile.id]);

  const calendarEvents = useMemo(
    () =>
      upcoming.map((session) => ({
        ...session,
        title: `${session.type} with ${students.find((student) => student.id === session.studentId)?.name ?? 'Student'}`,
      })),
    [upcoming, students]
  );

  const handleProfileSave = (field: 'expertise' | 'availability', value: string) => {
    const list = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    upsertTutor({ ...tutorProfile, [field]: list });
    toast.success('Profile updated');
  };

  const openSummary = (session: Session) => {
    setNoteDialog(session);
    setSummary(session.summary ?? generateSummaryTemplate(session));
  };

  const submitSummary = () => {
    if (!noteDialog) return;
    appendSummary(noteDialog.id, summary);
    toast.success('Summary shared with student & admin');
    setNoteDialog(null);
  };

  const approveRequest = (id: string) => {
    updateTutorRequest(id, 'Approved');
    toast.success('Request approved');
  };

  const rejectRequest = (id: string) => {
    updateTutorRequest(id, 'Rejected');
    toast.error('Request rejected');
  };

  const addOfficeHour = () => {
    const date = format(new Date().setDate(new Date().getDate() + 1), 'yyyy-MM-dd');
    addSession({
      studentId: myStudents[0]?.id ?? students[0].id,
      tutorId: tutorProfile.id,
      date,
      start: '10:00',
      end: '11:00',
      type: 'Online',
      status: 'Confirmed',
      summary: 'Open office hour',
    });
    toast.success('Office hour added to calendar');
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-brand/20 to-slate-900 p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-brand-light">Tutor cockpit</p>
            <h2 className="text-3xl font-semibold text-white">
              Hello, {tutorProfile.name.split(' ')[0]} — {myStudents.length} mentees rely on you today.
            </h2>
            <p className="max-w-2xl text-sm text-slate-400">
              Approve requests, manage availability, and drop quick summaries right after each session. We sync updates with admin reports automatically.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-900/60 px-6 py-5 text-sm text-slate-300">
            <p>Average rating</p>
            <p className="text-3xl font-bold text-white">{averageRating.toFixed(1)} ★</p>
            <p className="text-xs text-slate-500">Completion rate: {completionRate}%</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expertise</CardTitle>
            <CardDescription>Comma-separated keywords appear in student search.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              defaultValue={tutorProfile.expertise?.join(', ') ?? ''}
              onBlur={(event) => handleProfileSave('expertise', event.target.value)}
              placeholder="AI, Machine Learning, Research methods"
            />
            <Textarea
              defaultValue={tutorProfile.availability?.join(', ') ?? ''}
              onBlur={(event) => handleProfileSave('availability', event.target.value)}
              placeholder="Mon 10-12, Wed 14-16"
            />
            <Button onClick={addOfficeHour}>Add office hour for tomorrow</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Incoming requests</CardTitle>
            <CardDescription>Approve in one click — students notified instantly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {myRequests.map((request) => (
              <div key={request.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-sm font-semibold text-white">
                  {students.find((student) => student.id === request.studentId)?.name}
                </p>
                <p className="text-xs text-slate-400">{request.message}</p>
                <div className="mt-3 flex gap-3">
                  <Button size="sm" variant="secondary" onClick={() => approveRequest(request.id)}>
                    Accept
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => rejectRequest(request.id)}>
                    Decline
                  </Button>
                </div>
              </div>
            ))}
            {!myRequests.length && <p className="text-sm text-slate-500">No pending requests.</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session control center</CardTitle>
          <CardDescription>Launch calls, capture notes, and send summaries.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcoming.map((session) => {
            const student = students.find((item) => item.id === session.studentId);
            return (
              <div
                key={session.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold text-white">
                    {student?.name} • {format(new Date(`${session.date}T${session.start}`), 'EEE, MMM d HH:mm')}
                  </p>
                  <p className="text-xs text-slate-400">
                    {session.type} · status: {session.status}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => toast('🎥 Opening mock meeting room... (integration ready)')}
                  >
                    <Video className="mr-2 h-4 w-4" /> Join call
                  </Button>
                  <Button variant="ghost" onClick={() => openSummary(session)}>
                    <ClipboardList className="mr-2 h-4 w-4" /> Summary
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast('Progress note saved');
                    }}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" /> Quick note
                  </Button>
                </div>
              </div>
            );
          })}
          {!upcoming.length && <p className="text-sm text-slate-500">No upcoming sessions scheduled.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analytics snapshot</CardTitle>
          <CardDescription>Real-time insights across your mentees.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center">
            <p className="text-sm text-slate-400">Mentees supported</p>
            <p className="text-3xl font-semibold text-white">{myStudents.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center">
            <p className="text-sm text-slate-400">Average rating</p>
            <p className="text-3xl font-semibold text-white">{averageRating.toFixed(1)} ★</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center">
            <p className="text-sm text-slate-400">Completion rate</p>
            <p className="text-3xl font-semibold text-white">{completionRate}%</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Planner</CardTitle>
          <CardDescription>Drop office hours directly onto the shared calendar.</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            sessions={calendarEvents}
            onSelectSlot={(slot) => {
              toast.info(
                `Slot ${format(slot.start, 'MMM d HH:mm')} saved as draft. Students will request it soon.`
              );
            }}
            onEventClick={(event) => {
              toast(`${event.title} — status ${event.status}`);
            }}
          />
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(noteDialog)}
        onClose={() => setNoteDialog(null)}
        title="Share meeting summary"
        description="Students and admins receive an instant digest."
      >
        <Textarea value={summary} onChange={(event) => setSummary(event.target.value)} className="min-h-[180px]" />
        <Button onClick={submitSummary} className="w-full">
          <Check className="mr-2 h-4 w-4" /> Send summary
        </Button>
      </Dialog>
    </div>
  );
}

function generateSummaryTemplate(session: Session) {
  return `Session summary for ${format(new Date(`${session.date}T${session.start}`), 'MMM d, yyyy')}
Focus: ${session.notes ?? 'Concept reinforcement'}
Highlights: • Key win • Challenge to revisit
Action items: • Student to complete practice set • Tutor to share resource`;
}

export default TutorDashboard;
