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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <aside className="hidden w-72 flex-col border-r border-slate-800 bg-slate-950/80 p-6 backdrop-blur xl:flex">
        <Link to="/" className="mb-12 inline-flex items-center gap-2 text-lg font-semibold text-white">
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
                    'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-brand/20 hover:text-white',
                    (navActive || isActive) && 'bg-brand/30 text-white'
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
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-sm text-slate-400">Logged in as</p>
            <p className="font-semibold text-white">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
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
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-3 xl:hidden">
            <Link to="/" className="inline-flex items-center gap-2 text-lg font-semibold text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">T</span>
            </Link>
            <span className="text-sm font-medium text-slate-400">{user.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Fragment>
              <span className="hidden text-sm text-slate-400 md:inline">{user.email}</span>
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button variant="secondary" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </Fragment>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-hero-pattern px-4 py-10 md:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
