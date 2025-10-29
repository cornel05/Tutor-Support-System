import { useMemo } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import { format } from 'date-fns';
import { toast } from 'sonner';

const heatmapDepartments = ['Computer Science', 'Information Systems', 'Electronics', 'Business Technology'];

function AdminDashboard() {
  const { user } = useAuthStore();
  const { students, tutors, sessions, feedback, tutorRequests, resources } = useDataStore();

  if (!user) return null;

  const sessionStats = useMemo(() => {
    const counts = { Completed: 0, Cancelled: 0, Confirmed: 0, Pending: 0 } as Record<string, number>;
    sessions.forEach((session) => {
      counts[session.status] = (counts[session.status] ?? 0) + 1;
    });
    return Object.entries(counts).map(([status, value]) => ({ status, value }));
  }, [sessions]);

  const feedbackPie = useMemo(() => {
    const distribution = [1, 2, 3, 4, 5].map((rating) => ({ rating, value: 0 }));
    feedback.forEach((item) => {
      const bucket = distribution.find((entry) => entry.rating === item.rating);
      if (bucket) bucket.value += 1;
    });
    return distribution;
  }, [feedback]);

  const progressLine = useMemo(() => {
    return students.map((student) => ({
      student: student.name.split(' ')[0],
      progress: Math.min(100, 50 + Math.random() * 40),
    }));
  }, [students]);

  const resourceHeatmap = useMemo(() => {
    return heatmapDepartments.map((department, index) => ({
      department,
      usage: 40 + index * 10 + Math.random() * 20,
    }));
  }, []);

  const exportCsv = () => {
    const rows = [
      ['Session ID', 'Student', 'Tutor', 'Date', 'Status'],
      ...sessions.map((session) => [
        session.id,
        students.find((student) => student.id === session.studentId)?.name ?? 'Unknown',
        tutors.find((tutor) => tutor.id === session.tutorId)?.name ?? 'Unknown',
        `${session.date} ${session.start}`,
        session.status,
      ]),
    ];
    const csvContent = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'tutor-system-report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Mock CSV exported');
  };

  const latestRequests = tutorRequests.slice(-3).reverse();

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-800 bg-gradient-to-r from-brand-dark/60 via-brand/40 to-slate-900 p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">Admin command center</p>
            <h2 className="text-3xl font-semibold text-white">
              Snapshot ready, {user.name.split(' ')[0]} — {sessions.length} sessions monitored this week.
            </h2>
            <p className="max-w-2xl text-sm text-white/70">
              Real-time dashboards power data-informed mentorship decisions. Export CSVs, audit requests, and share curated resources.
            </p>
          </div>
          <Button onClick={exportCsv} className="self-start">Export CSV</Button>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>Active mentees</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-white">{students.length}</p>
            <p className="text-xs text-slate-500">+3 since last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tutors</CardTitle>
            <CardDescription>Faculty & seniors</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-white">{tutors.length}</p>
            <p className="text-xs text-slate-500">92% availability synced</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Feedback avg</CardTitle>
            <CardDescription>Based on {feedback.length} responses</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-white">
              {feedback.length
                ? (
                    feedback.reduce((acc, item) => acc + item.rating, 0) / feedback.length
                  ).toFixed(1)
                : '0.0'}{' '}
              ★
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Requests pending</CardTitle>
            <CardDescription>Need tutor approval</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-white">
              {tutorRequests.filter((request) => request.status === 'Pending').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Session stats</CardTitle>
            <CardDescription>Completed vs Cancelled across program</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="status" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#0f172a', borderRadius: 12 }} />
                <Bar dataKey="value" fill="#38bdf8" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student performance</CardTitle>
            <CardDescription>Mock progression data</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressLine}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="student" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#0f172a', borderRadius: 12 }} />
                <Line type="monotone" dataKey="progress" stroke="#34d399" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Feedback sentiment</CardTitle>
            <CardDescription>Distribution of ratings</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={{ background: '#0f172a', borderRadius: 12 }} />
                <Pie data={feedbackPie} dataKey="value" nameKey="rating" innerRadius={60} outerRadius={100}>
                  {feedbackPie.map((entry, index) => (
                    <Cell key={index} fill={['#ef4444', '#f97316', '#facc15', '#34d399', '#60a5fa'][index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource allocation</CardTitle>
            <CardDescription>Department usage heatmap (mock)</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resourceHeatmap}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="department" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#0f172a', borderRadius: 12 }} />
                <Bar dataKey="usage" radius={[12, 12, 0, 0]}>
                  {resourceHeatmap.map((entry, index) => (
                    <Cell key={entry.department} fill={['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'][index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Users directory</CardTitle>
            <CardDescription>Top mentors & mentees</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-300">Tutors</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-400">
                {tutors.slice(0, 5).map((tutor) => (
                  <li key={tutor.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2">
                    <span>{tutor.name}</span>
                    <Badge variant="success">{tutor.rating?.toFixed(1)} ★</Badge>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-300">Students</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-400">
                {students.slice(0, 5).map((student) => (
                  <li key={student.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2">
                    <span>{student.name}</span>
                    <Badge>{student.major}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest activity</CardTitle>
            <CardDescription>Recent tutor approvals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestRequests.map((request) => (
              <div key={request.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-sm font-semibold text-white">
                  {students.find((student) => student.id === request.studentId)?.name} →{' '}
                  {tutors.find((tutor) => tutor.id === request.tutorId)?.name}
                </p>
                <p className="text-xs text-slate-400">{format(new Date(request.createdAt), 'MMM d, HH:mm')}</p>
                <Badge
                  variant={
                    request.status === 'Approved'
                      ? 'success'
                      : request.status === 'Rejected'
                      ? 'danger'
                      : 'warning'
                  }
                  className="mt-2"
                >
                  {request.status}
                </Badge>
              </div>
            ))}
            {!latestRequests.length && <p className="text-sm text-slate-500">No recent activity.</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resource hub</CardTitle>
          <CardDescription>Curated assets from Datacore & Library</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {resources.map((resource) => (
            <a
              key={resource.id}
              href={resource.url}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-brand hover:text-white"
            >
              <p className="text-sm font-semibold">{resource.title}</p>
              <p className="text-xs text-slate-400">{resource.description}</p>
              <div className="mt-2 text-[10px] uppercase tracking-widest text-brand-light">
                {resource.tags.join(' · ')}
              </div>
            </a>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminDashboard;
