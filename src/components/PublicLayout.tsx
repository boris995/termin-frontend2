import { BarChart3, CalendarClock, Home, ListOrdered, LogIn, Newspaper, Trophy, Users } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/', label: 'Pocetna', icon: Home },
  { to: '/sezone', label: 'Sezone', icon: Trophy },
  { to: '/rezultati', label: 'Rezultati', icon: ListOrdered },
  { to: '/igraci', label: 'Igraci', icon: Users },
  { to: '/najava', label: 'Najava', icon: CalendarClock }
];

export const PublicLayout = () => (
  <div className="min-h-screen">
    <header className="sticky top-0 z-30 border-b border-white/10 bg-blue-950/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded bg-orange-500 text-blue-950">
            <Newspaper size={21} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">Football Face-Off</p>
            <h1 className="text-lg font-black text-white">Duel Liga</h1>
          </div>
        </NavLink>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <nav className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `inline-flex shrink-0 items-center gap-2 rounded px-3 py-2 text-sm font-bold transition ${
                    isActive ? 'bg-orange-500 text-blue-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </nav>
          <NavLink
            to={localStorage.getItem('token') ? '/dashboard' : '/login'}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded bg-orange-500 px-4 py-2 text-sm font-black text-blue-950 transition hover:bg-orange-400"
          >
            {localStorage.getItem('token') ? <BarChart3 size={17} /> : <LogIn size={17} />}
            {localStorage.getItem('token') ? 'Dashboard' : 'Admin login'}
          </NavLink>
        </div>
      </div>
    </header>
    <Outlet />
  </div>
);
