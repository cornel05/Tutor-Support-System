import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useEffect } from 'react';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function Login() {
  const navigate = useNavigate();
  const { user, login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'student1@hcmut.edu.vn',
      password: 'pass123',
    },
  });

  useEffect(() => {
    if (user) {
      navigate(`/${user.role}`);
    }
  }, [user, navigate]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const result = await login(values.email, values.password);
      toast.success(`Welcome back, ${result.name}!`);
      navigate(`/${result.role}`);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-6 py-16 lg:flex-row lg:gap-16">
        <div className="max-w-xl space-y-6 text-center lg:text-left">
          <span className="inline-flex items-center rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-brand-dark dark:border-brand/40 dark:bg-brand/20 dark:text-brand-light">
            HCMUT Mentor Program
          </span>
          <h1 className="text-4xl font-semibold text-slate-900 transition-colors dark:text-white md:text-5xl">
            Accelerate every tutoring journey with a single platform.
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Login with mock SSO credentials. Roles: student1, tutor1, admin. Tailored dashboards, seamless scheduling, and delightful feedback loops.
          </p>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-10 w-full max-w-md space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-2xl backdrop-blur transition-colors dark:border-slate-800 dark:bg-slate-900/60"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@hcmut.edu.vn" autoComplete="email" {...register('email')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Authenticating...' : 'Enter the Tutor Hub'}
          </Button>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Demo creds → Student: student1@hcmut.edu.vn / pass123 · Tutor: tutor1@hcmut.edu.vn / pass123 · Admin: admin@hcmut.edu.vn / pass123
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
