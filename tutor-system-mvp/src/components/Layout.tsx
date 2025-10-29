import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { useTheme } from '../theme/ThemeProvider';
import { Switch } from './ui/switch';
import { Home, LogOut, Moon, Sun } from 'lucide-react';
import { Fragment } from 'react';

const navConfig = {
  student: [
    { to: '/student', label: 'Dashboard', icon: Home },
  ],
  tutor: [
    { to: '/tutor', label: 'Dashboard', icon: Home },
  ],
  admin: [
    { to: '/admin', label: 'Command Center', icon: Home },
  ],
};

export function Layout() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  if (!user) {
    return <Outlet />;
  }

  const navItems = navConfig[user.role];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white/70 p-6 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-slate-800 dark:bg-slate-950/80 xl:flex">
        <Link
          to="/"
          className="mb-12 inline-flex items-center gap-2 text-lg font-semibold text-slate-900 transition-colors dark:text-white"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">T</span>
          Tutor Support
        </Link>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive: navActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-brand/10 hover:text-brand-dark dark:hover:bg-brand/20 dark:hover:text-white',
                    (navActive || isActive) && 'bg-brand/20 text-brand-dark dark:bg-brand/30 dark:text-white'
                  )
                }
              >
                <Icon className="h-5 w-5" aria-hidden />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="mt-auto space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white/80 p-4 text-slate-600 transition-colors dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
            <p className="text-sm">Logged in as</p>
            <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-500">{user.email}</p>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-600 transition-colors dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
            <div className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span className="text-sm">Dark mode</span>
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} />
          </div>
          <Button variant="outline" onClick={logout} className="w-full">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur transition-colors supports-[backdrop-filter]:bg-white/70 dark:border-slate-800 dark:bg-slate-950/70">
          <div className="flex items-center gap-3 xl:hidden">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900 transition-colors dark:text-white"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">T</span>
            </Link>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{user.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Fragment>
              <span className="hidden text-sm text-slate-500 dark:text-slate-400 md:inline">{user.email}</span>
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button variant="secondary" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </Fragment>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-white via-slate-100 to-white px-4 py-10 transition-colors dark:bg-hero-pattern md:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
