import { useMemo, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog } from '../components/ui/dialog';
import { Calendar } from '../components/Calendar';
import { FeedbackForm } from '../components/FeedbackForm';
import { Feedback, Session, User } from '../types';
import { toast } from 'sonner';
import Confetti from 'react-confetti';
import { useSessions } from '../hooks/useSessions';
import { useWindowSize } from '@uidotdev/usehooks';
import { format, isValid, parseISO } from 'date-fns';
import { CalendarClock, NotebookPen, Send, Sparkles, Star } from 'lucide-react';

const needsPlaceholder = 'Share what you need help with, e.g. "Struggling with calculus integrals" or "Need feedback on AI project".';

// Safe date formatting helper
function safeFormatDate(dateString: string, timeString: string, formatStr: string): string {
  try {
    const dateTime = `${dateString}T${timeString}`;
    const date = new Date(dateTime);
    if (isValid(date)) {
      return format(date, formatStr);
    }
  } catch (error) {
    console.error('Invalid date:', dateString, timeString, error);
  }
  return 'Invalid date';
}

function StudentDashboard() {
  const { user } = useAuthStore();
  const {
    students,
    tutors,
    sessions,
    upsertStudent,
    addSession,
    resources,
    feedback,
    addFeedback,
    tutorRequests,
    addTutorRequest,
  } =
    useDataStore();
  const [editingNeeds, setEditingNeeds] = useState(user?.needs?.join(', ') ?? '');
  const [expertiseFilter, setExpertiseFilter] = useState('');
  const [selectedTutor, setSelectedTutor] = useState<User | null>(null);
  const [openBooking, setOpenBooking] = useState(false);
  const [openFeedback, setOpenFeedback] = useState<Session | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const windowSize = useWindowSize();
  const { upcoming, past } = useSessions();

  if (!user) return null;

  const currentStudent = students.find((s) => s.id === user.id) ?? user;
  const myRequests = tutorRequests.filter((request) => request.studentId === user.id);

  const filteredTutors = useMemo(() => {
    if (!expertiseFilter) return tutors;
    return tutors.filter(
      (tutor) =>
        tutor.expertise?.some((area) => area.toLowerCase().includes(expertiseFilter.toLowerCase())) ||
        tutor.major?.toLowerCase().includes(expertiseFilter.toLowerCase())
    );
  }, [expertiseFilter, tutors]);

  const calendarEvents = useMemo(
    () =>
      upcoming.map((session) => ({
        ...session,
        title: `${session.type} with ${tutors.find((tutor) => tutor.id === session.tutorId)?.name ?? 'Tutor'}`,
      })),
    [upcoming, tutors]
  );

  const handleSaveProfile = () => {
    const needsArray = editingNeeds
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    upsertStudent({ ...currentStudent, needs: needsArray });
    toast.success('Profile updated');
  };

  const handleBook = (sessionData: Partial<Session>) => {
    if (!selectedTutor) return;
    const base: Omit<Session, 'id'> = {
      studentId: user.id,
      tutorId: selectedTutor.id,
      date: sessionData.date ?? format(new Date(), 'yyyy-MM-dd'),
      start: sessionData.start ?? '14:00',
      end: sessionData.end ?? '15:00',
      type: (sessionData.type as Session['type']) ?? 'Online',
      status: 'Pending',
    };

    const conflict = sessions.some(
      (existing) =>
        existing.date === base.date &&
        existing.studentId === base.studentId &&
        ((existing.start <= base.start && base.start < existing.end) ||
          (base.start <= existing.start && existing.start < base.end))
    );
    if (conflict) {
      toast.error('You already have a session at that time. Pick another slot.');
      return;
    }

    addSession(base);
    addTutorRequest({ studentId: user.id, tutorId: selectedTutor.id, message: 'New session request from dashboard.' });
    toast.success('Session requested — tutor will confirm soon!');
    setOpenBooking(false);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  };

  const handleFeedbackSubmit = (item: Feedback) => {
    addFeedback(item);
    toast.success('Feedback captured. Admins & tutors notified!');
    setOpenFeedback(null);
  };

  return (
    <div className="space-y-8">
      {showConfetti && <Confetti width={windowSize.width ?? 1280} height={windowSize.height ?? 720} recycle={false} />}
      <section className="rounded-3xl border border-brand/30 bg-gradient-to-r from-brand-dark/60 via-brand/40 to-brand-light/40 p-8 shadow-glow">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white">
              <Sparkles className="h-4 w-4" /> Student HQ
            </p>
            <h2 className="text-3xl font-semibold text-white md:text-4xl">
              Welcome back, {currentStudent.name.split(' ')[0]}! Your learning path is on track.
            </h2>
            <p className="max-w-2xl text-sm text-white/70">
              Track sessions, request top-rated tutors, and share reflections in seconds. We'll auto-notify tutors and admins on every update.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-6 py-5 text-sm text-white/90">
            <p className="font-semibold">Next session</p>
            {upcoming.length > 0 && upcoming[0].date && upcoming[0].start ? (
              <p>
                {safeFormatDate(upcoming[0].date, upcoming[0].start, 'EEE, MMM d • HH:mm')} with{' '}
                <span className="font-semibold text-white">
                  {tutors.find((t) => t.id === upcoming[0].tutorId)?.name}
                </span>
              </p>
            ) : (
              <p>No sessions booked yet. Let's start!</p>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Your profile</CardTitle>
            <CardDescription>Keep mentors in the loop about your goals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Major</Label>
              <Input value={currentStudent.major} disabled />
            </div>
            <div className="space-y-2">
              <Label>Learning needs</Label>
              <Textarea
                value={editingNeeds}
                onChange={(event) => setEditingNeeds(event.target.value)}
                placeholder={needsPlaceholder}
              />
            </div>
            <Button onClick={handleSaveProfile} className="w-full">
              Save profile updates
            </Button>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-400">
              <p className="font-semibold text-slate-200">Pro tip</p>
              Mention courses, deadlines, or exam prep so tutors can tailor sessions.
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Discover tutors</CardTitle>
            <CardDescription>Filter by expertise, major, or rating.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              placeholder="Search AI, robotics, startup..."
              value={expertiseFilter}
              onChange={(event) => setExpertiseFilter(event.target.value)}
            />
            <div className="grid gap-4 md:grid-cols-2">
              {filteredTutors.map((tutor) => (
                <div
                  key={tutor.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-brand hover:shadow-glow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">{tutor.name}</p>
                      <p className="text-xs uppercase tracking-widest text-slate-500">{tutor.major}</p>
                    </div>
                    <Badge variant="success" className="text-[11px]">
                      <Star className="mr-1 h-3 w-3" /> {tutor.rating?.toFixed(1)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{tutor.expertise?.join(' • ')}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSelectedTutor(tutor);
                        setOpenBooking(true);
                      }}
                    >
                      <CalendarClock className="mr-2 h-4 w-4" /> Book
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        addTutorRequest({ studentId: user.id, tutorId: tutor.id, message: 'Would love to connect!' });
                        toast.success('Request sent! We pinged the tutor.');
                      }}
                    >
                      <Send className="mr-2 h-4 w-4" /> Request match
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly planner</CardTitle>
            <CardDescription>Drag, drop, and align with tutor availability.</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              sessions={calendarEvents}
              onSelectSlot={(slot) => {
                if (!selectedTutor) {
                  toast.info('Select a tutor before booking.');
                  return;
                }
                handleBook({
                  date: format(slot.start, 'yyyy-MM-dd'),
                  start: format(slot.start, 'HH:mm'),
                  end: format(slot.end ?? slot.start, 'HH:mm'),
                });
              }}
              onEventClick={(event) => {
                const tutorName = tutors.find((tutor) => tutor.id === event.tutorId)?.name ?? 'Tutor';
                toast(messageWithStatus(event, tutorName));
              }}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My requests</CardTitle>
              <CardDescription>Track approvals in real-time.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {myRequests.map((request) => (
                <div key={request.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <p className="text-sm font-semibold text-white">
                    {tutors.find((tutor) => tutor.id === request.tutorId)?.name}
                  </p>
                  <p className="text-xs text-slate-400">{request.message}</p>
                  <Badge
                    variant={
                      request.status === 'Approved'
                        ? 'success'
                        : request.status === 'Rejected'
                        ? 'danger'
                        : 'default'
                    }
                    className="mt-2"
                  >
                    {request.status}
                  </Badge>
                </div>
              ))}
              {!myRequests.length && <p className="text-sm text-slate-500">No requests yet.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resource spotlight</CardTitle>
              <CardDescription>Powered by HCMUT Library.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resources.slice(0, 3).map((resource) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  className="block rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-brand hover:text-white"
                >
                  <p className="text-sm font-semibold">{resource.title}</p>
                  <p className="text-xs text-slate-400">{resource.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-widest text-brand-light">
                    {resource.tags.map((tag) => (
                      <span key={tag}>#{tag}</span>
                    ))}
                  </div>
                </a>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming sessions</CardTitle>
            <CardDescription>Cancel or reschedule with one tap.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcoming.map((session) => (
              <div
                key={session.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold text-white">
                    {safeFormatDate(session.date, session.start, 'EEE, MMM d • HH:mm')}
                  </p>
                  <p className="text-sm text-slate-400">
                    with {tutors.find((tutor) => tutor.id === session.tutorId)?.name} • {session.type}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      toast('Reminder set ✨ We will notify you 15 minutes prior.');
                      setTimeout(() => toast('⏰ Session starting soon!'), 5000);
                    }}
                  >
                    <NotebookPen className="mr-2 h-4 w-4" /> Remind me
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast.info('Reschedule flow coming soon.');
                    }}
                  >
                    Reschedule
                  </Button>
                </div>
              </div>
            ))}
            {!upcoming.length && <p className="text-sm text-slate-500">No upcoming sessions yet.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Past reflections</CardTitle>
            <CardDescription>Leave feedback to boost mentor insights.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {past.map((session) => {
              const existingFeedback = feedback.find((item) => item.sessionId === session.id);
              const tutor = tutors.find((tutor) => tutor.id === session.tutorId);
              return (
                <div key={session.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-white">{tutor?.name}</p>
                      <p className="text-xs text-slate-400">
                        {safeFormatDate(session.date, session.start, 'MMM d, yyyy')} • {session.type}
                      </p>
                    </div>
                    {existingFeedback ? (
                      <Badge variant="success">{existingFeedback.rating} ★</Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => {
                          setOpenFeedback(session);
                        }}
                      >
                        Add feedback
                      </Button>
                    )}
                  </div>
                  {existingFeedback && <p className="mt-2 text-sm text-slate-300">“{existingFeedback.comment}”</p>}
                </div>
              );
            })}
            {!past.length && <p className="text-sm text-slate-500">Complete sessions to reflect.</p>}
          </CardContent>
        </Card>
      </section>

      <Dialog
        open={openBooking}
        onClose={() => setOpenBooking(false)}
        title={`Book ${selectedTutor?.name}`}
        description="Pick a slot that works for you. We'll alert the tutor instantly."
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Suggested availability: {selectedTutor?.expertise?.slice(0, 2).join(', ')} • This tutor loves {selectedTutor?.major}.
          </p>
          <Button
            className="w-full"
            onClick={() =>
              handleBook({
                date: format(new Date(), 'yyyy-MM-dd'),
                start: '14:00',
                end: '15:00',
              })
            }
          >
            Quick book (Tomorrow 2PM)
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              addTutorRequest({ studentId: user.id, tutorId: selectedTutor!.id, message: 'Can we explore more options?' });
              toast.success('Tutor notified for custom scheduling.');
              setOpenBooking(false);
            }}
            className="w-full"
          >
            Ask for custom slots
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={Boolean(openFeedback)}
        onClose={() => setOpenFeedback(null)}
        title="Share your feedback"
        description="Boost tutor insights with a quick star rating and comment."
      >
        {openFeedback && (
          <FeedbackForm
            sessionId={openFeedback.id}
            defaultValue={feedback.find((item) => item.sessionId === openFeedback.id)}
            onSubmit={handleFeedbackSubmit}
          />
        )}
      </Dialog>
    </div>
  );
}

function messageWithStatus(session: Session, tutorName: string) {
  const prefix = session.status === 'Pending' ? 'Awaiting confirmation' : session.status;
  return `${prefix} with ${tutorName} on ${safeFormatDate(session.date, session.start, 'MMM d HH:mm')}`;
}

export default StudentDashboard;
