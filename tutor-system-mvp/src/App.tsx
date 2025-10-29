import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useAuthStore } from './stores/authStore';
import { Loader2 } from 'lucide-react';

const Login = lazy(() => import('./pages/Login'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const TutorDashboard = lazy(() => import('./pages/TutorDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function ProtectedRoute({ children, role }: { children: JSX.Element; role?: string }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return children;
}

const Loader = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 transition-colors dark:bg-slate-950 dark:text-slate-400">
    <Loader2 className="mr-3 h-5 w-5 animate-spin" /> Loading Tutor Support...
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/student/*"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutor/*"
            element={
              <ProtectedRoute role="tutor">
                <TutorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
}
