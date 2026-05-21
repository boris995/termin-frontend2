import { BarChart3, Calendar, CalendarPlus, FilePlus, FileText, HeartHandshake, Home, ListChecks, LogOut, Menu, Settings, Shield, Trophy, Users, X } from 'lucide-react';
import { useState } from 'react';
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
  { to: '/cms/donation', label: 'Donacije', icon: HeartHandshake },
  { to: '/cms/content', label: 'Dodaj sadrzaj', icon: FilePlus },
  { to: '/cms/next-match', label: 'Najavi mec', icon: CalendarPlus },
  { to: '/cms/blocks', label: 'Objavljeni blokovi', icon: FileText },
  { to: '/cms/next-matches', label: 'Najave utakmica', icon: ListChecks }
];

const bottomLinks = links.slice(1, 6);

export const AppLayout = () => {
  const { siteDesign, setSiteDesign } = useCardDesign();
  const [menuOpen, setMenuOpen] = useState(false);
  const isPremium = siteDesign === 'premium';
  const toggleTheme = () => setSiteDesign(isPremium ? 'classic' : 'premium');
  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
  <div className={`min-h-screen overflow-x-hidden ${isPremium ? 'bg-[#05070b] text-white' : 'admin-classic text-[#2d2c27]'}`}>
    <header className={`sticky top-0 z-30 border-b lg:hidden ${
      isPremium ? 'border-emerald-400/15 bg-[#05070b]' : 'border-[#504d43] bg-[#ebe4d4]'
    }`}>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <NavLink to="/dashboard" className="flex min-w-0 items-center gap-3" onClick={() => setMenuOpen(false)}>
          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded ${
            isPremium ? 'bg-emerald-400 text-slate-950 shadow-[0_0_24px_rgba(52,211,153,0.25)]' : 'border-2 border-[#504d43] bg-[#d8d2c3] text-[#8f332d]'
          }`}>
            <Trophy size={21} />
          </div>
          <div className="min-w-0">
            <p className={`text-xs font-black uppercase tracking-[0.20em] ${isPremium ? 'text-emerald-400' : 'text-[#8f332d]'}`}>Admin</p>
            <h1 className={`truncate text-lg font-black uppercase ${isPremium ? 'text-white' : 'text-[#2d2c27]'}`}>Duel Liga</h1>
          </div>
        </NavLink>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`rounded border px-3 py-2 text-xs font-black ${
              isPremium
                ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
                : 'border-[#504d43] bg-[#e7dfce] text-[#2d2c27]'
            }`}
            onClick={toggleTheme}
          >
            {isPremium ? 'Premium' : 'Classic'}
          </button>
          <button
            type="button"
            className={`grid h-10 w-10 place-items-center rounded border ${
              isPremium ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300' : 'border-[#504d43] bg-[#e7dfce] text-[#2d2c27]'
            }`}
            onClick={() => setMenuOpen((current) => !current)}
            aria-label={menuOpen ? 'Zatvori admin meni' : 'Otvori admin meni'}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className={`max-h-[calc(100vh-4.25rem)] overflow-y-auto border-t px-4 py-3 ${
          isPremium ? 'border-emerald-400/15 bg-[#05070b]' : 'border-[#504d43] bg-[#ebe4d4]'
        }`}>
          <nav className="grid gap-2">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `inline-flex items-center gap-3 rounded px-3 py-3 text-sm font-black transition ${
                    isActive
                      ? isPremium
                        ? 'bg-emerald-400 text-slate-950'
                        : 'border-2 border-[#504d43] bg-[#8f332d] text-[#f4eddd]'
                      : isPremium
                        ? 'bg-white/[0.03] text-slate-300 hover:bg-emerald-400/10 hover:text-emerald-300'
                        : 'border-2 border-[#504d43] bg-[#e7dfce] text-[#2d2c27] hover:bg-[#d8d2c3]'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
            <button
              type="button"
              className={`mt-1 inline-flex items-center gap-3 rounded px-3 py-3 text-sm font-black ${
                isPremium
                  ? 'border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                  : 'border-2 border-[#504d43] bg-[#f4eddd] text-[#504d43] hover:bg-[#8f332d] hover:text-[#f4eddd]'
              }`}
              onClick={logout}
            >
              <LogOut size={18} />
              Logout
            </button>
          </nav>
        </div>
      )}
    </header>
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
        onClick={logout}
      >
        Logout
      </button>
    </aside>
    <main className={`min-h-screen px-4 pb-24 pt-5 lg:ml-64 lg:px-8 lg:pb-5 ${isPremium ? 'bg-[#05070b]' : 'bg-[#d8d2c3]'}`}>
      <div className="mx-auto max-w-7xl">
        <Outlet />
      </div>
    </main>
    <nav className={`fixed bottom-0 left-0 right-0 z-40 w-full max-w-full overflow-hidden border-t lg:hidden ${
      isPremium ? 'border-emerald-400/15 bg-[#05070b]' : 'border-[#504d43] bg-[#ebe4d4]'
    }`}>
      <div className="grid w-full min-w-0 grid-cols-5 px-0.5 py-1.5">
        {bottomLinks.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `flex min-w-0 flex-col items-center justify-center gap-0.5 rounded px-0.5 py-1.5 text-[0.56rem] font-black leading-none transition sm:text-[0.62rem] ${
                isActive
                  ? isPremium
                    ? 'text-emerald-400'
                    : 'text-[#8f332d]'
                  : isPremium
                    ? 'text-slate-500'
                    : 'text-[#504d43]'
              }`
            }
          >
            <Icon size={17} />
            <span className="max-w-full truncate">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  </div>
  );
};
