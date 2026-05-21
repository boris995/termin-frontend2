import { BarChart3, Calendar, CalendarPlus, FilePlus, FileText, Home, ListChecks, Settings, Shield, Trophy, Users } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useCardDesign } from './CardDesignProvider';

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/seasons', label: 'Sezone', icon: Trophy },
  { to: '/seasons/1/teams', label: 'Timovi', icon: Shield },
  { to: '/seasons/1/players', label: 'Igrači', icon: Users },
  { to: '/seasons/1/matches', label: 'Mečevi', icon: Calendar },
  { to: '/cms/settings', label: 'Dizajn', icon: Settings },
  { to: '/cms/content', label: 'Dodaj sadrzaj', icon: FilePlus },
  { to: '/cms/next-match', label: 'Najavi mec', icon: CalendarPlus },
  { to: '/cms/blocks', label: 'Objavljeni blokovi', icon: FileText },
  { to: '/cms/next-matches', label: 'Najave utakmica', icon: ListChecks }
];

export const AppLayout = () => {
  const { siteDesign, setSiteDesign } = useCardDesign();
  const isPremium = siteDesign === 'premium';

  return (
  <div className={`min-h-screen ${isPremium ? 'bg-[#05070b] text-white' : 'admin-classic text-[#2d2c27]'}`}>
    <aside className={`fixed inset-y-0 left-0 z-20 hidden w-64 border-r px-4 py-6 lg:block ${
      isPremium
        ? 'border-emerald-400/15 bg-[#05070b]'
        : 'border-[#504d43] bg-[#e7dfce] shadow-[8px_0_24px_rgba(45,44,39,0.12)]'
    }`}>
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className={`grid h-10 w-10 place-items-center rounded ${isPremium ? 'bg-emerald-400 text-slate-950' : 'border-2 border-[#504d43] bg-[#d9cfba] text-[#8f332d]'}`}>
          <Trophy size={22} />
        </div>
        <div>
          <p className={`text-sm uppercase tracking-[0.22em] ${isPremium ? 'text-emerald-400' : 'text-[#8f332d]'}`}>Liga</p>
          <h1 className={`text-lg font-black uppercase ${isPremium ? '' : 'text-[#2d2c27]'}`}>Duel Liga</h1>
        </div>
      </div>
      <nav className="space-y-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded px-3 py-3 text-sm font-semibold transition ${
                isActive
                  ? isPremium
                    ? 'bg-emerald-400 text-slate-950'
                    : 'border-2 border-[#504d43] bg-[#8f332d] text-[#f4eddd] shadow-[3px_3px_0_rgba(80,77,67,0.25)]'
                  : isPremium
                    ? 'text-slate-400 hover:bg-emerald-400/10 hover:text-emerald-300'
                    : 'border-2 border-transparent text-[#504d43] hover:border-[#504d43] hover:bg-[#d9cfba] hover:text-[#2d2c27]'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <button
        className={`mt-6 w-full rounded border px-3 py-2 text-sm font-bold ${
          isPremium
            ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20'
            : 'border-[#504d43] bg-[#f4eddd] text-[#2d2c27] hover:bg-[#504d43] hover:text-[#f4eddd]'
        }`}
        onClick={() => setSiteDesign(isPremium ? 'classic' : 'premium')}
      >
        Tema: {isPremium ? 'Premium' : 'Classic'}
      </button>
      <button
        className={`mt-3 w-full rounded border px-3 py-2 text-sm font-bold ${
          isPremium
            ? 'border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
            : 'border-[#504d43] text-[#504d43] hover:bg-[#8f332d] hover:text-[#f4eddd]'
        }`}
        onClick={() => {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }}
      >
        Logout
      </button>
    </aside>
    <main className={`min-h-screen px-4 py-5 lg:ml-64 lg:px-8 ${isPremium ? 'bg-[#05070b]' : 'bg-[#d8d2c3]'}`}>
      <div className="mx-auto max-w-7xl">
        <Outlet />
      </div>
    </main>
  </div>
  );
};
