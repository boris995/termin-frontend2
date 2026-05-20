import { BarChart3, Calendar, FileText, Home, Shield, Trophy, Users } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/seasons', label: 'Sezone', icon: Trophy },
  { to: '/seasons/1/teams', label: 'Timovi', icon: Shield },
  { to: '/seasons/1/players', label: 'Igrači', icon: Users },
  { to: '/seasons/1/matches', label: 'Mečevi', icon: Calendar },
  { to: '/cms', label: 'CMS', icon: FileText }
];

export const AppLayout = () => (
  <div className="min-h-screen">
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-white/10 bg-slate-950/80 px-4 py-6 backdrop-blur lg:block">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="grid h-10 w-10 place-items-center rounded bg-orange-500 text-blue-950">
          <Trophy size={22} />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-orange-300">Face-Off</p>
          <h1 className="text-lg font-bold">Football Duel</h1>
        </div>
      </div>
      <nav className="space-y-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded px-3 py-3 text-sm font-semibold transition ${
                isActive ? 'bg-orange-500 text-blue-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <button
        className="mt-6 w-full rounded border border-white/10 px-3 py-2 text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white"
        onClick={() => {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }}
      >
        Logout
      </button>
    </aside>
    <main className="min-h-screen px-4 py-5 lg:ml-64 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Outlet />
      </div>
    </main>
  </div>
);
