import { BarChart3, CalendarClock, HeartHandshake, Home, ListOrdered, LogIn, Menu, Newspaper, Search, Trophy, Users, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useCardDesign } from './CardDesignProvider';

const links = [
  { to: '/', label: 'Pocetna', icon: Home },
  { to: '/sezone', label: 'Sezone', icon: Trophy },
  { to: '/rezultati', label: 'Rezultati', icon: ListOrdered },
  { to: '/igraci', label: 'Igraci', icon: Users },
  { to: '/pretraga', label: 'Pretraga', icon: Search },
  { to: '/najava', label: 'Najava', icon: CalendarClock },
  { to: '/donacije', label: 'Donacije', icon: HeartHandshake }
];

export const PublicLayout = () => {
  const { siteDesign, setSiteDesign } = useCardDesign();
  const [menuOpen, setMenuOpen] = useState(false);
  const isPremium = siteDesign === 'premium';
  const token = localStorage.getItem('token');
  const adminTarget = token ? '/dashboard' : '/login';
  const adminLabel = token ? 'Dashboard' : 'Admin login';
  const AdminIcon = token ? BarChart3 : LogIn;
  const toggleTheme = () => setSiteDesign(isPremium ? 'classic' : 'premium');

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <header className={`sticky top-0 z-30 border-b ${
        isPremium ? 'border-emerald-400/15 bg-[#05070b]' : 'border-[#504d43] bg-[#ebe4d4]'
      }`}
      >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
        <NavLink to="/" className="flex items-center gap-3">
          <div className={`grid h-10 w-10 place-items-center rounded ${
            isPremium ? 'bg-emerald-400 text-slate-950 shadow-[0_0_24px_rgba(52,211,153,0.25)]' : 'border-2 border-[#504d43] bg-[#d8d2c3] text-[#2d2c27]'
          }`}
          >
            <Newspaper size={21} />
          </div>
          <div>
            <p className={`text-xs font-black uppercase tracking-[0.22em] ${isPremium ? 'text-emerald-400' : 'text-[#8f332d]'}`}>Duel Liga</p>
            <h1 className={`text-lg font-black ${isPremium ? 'text-white' : 'text-[#2d2c27]'}`}>Duel Liga</h1>
          </div>
        </NavLink>
        <button
          type="button"
          className={`grid h-10 w-10 place-items-center rounded border lg:hidden ${
            isPremium ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300' : 'border-[#504d43] bg-[#e7dfce] text-[#2d2c27]'
          }`}
          onClick={() => setMenuOpen((current) => !current)}
          aria-label={menuOpen ? 'Zatvori meni' : 'Otvori meni'}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <div className="hidden flex-col gap-3 lg:flex lg:flex-row lg:items-center">
          <nav className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `inline-flex shrink-0 items-center gap-2 rounded px-3 py-2 text-sm font-bold transition ${
                    isActive
                      ? isPremium
                        ? 'bg-emerald-400 text-slate-950'
                        : 'bg-[#504d43] text-[#ebe4d4]'
                      : isPremium
                        ? 'text-slate-400 hover:bg-emerald-400/10 hover:text-emerald-300'
                        : 'text-[#504d43] hover:bg-[#d8d2c3] hover:text-[#2d2c27]'
                  }`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            onClick={toggleTheme}
            className={`inline-flex shrink-0 items-center justify-center rounded px-4 py-2 text-sm font-black transition ${
              isPremium ? 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20' : 'border-2 border-[#504d43] bg-[#e7dfce] text-[#2d2c27] hover:bg-[#504d43] hover:text-[#ebe4d4]'
            }`}
          >
            {isPremium ? 'Premium' : 'Classic'}
          </button>
          <NavLink
            to={adminTarget}
            className={`inline-flex shrink-0 items-center justify-center gap-2 rounded px-4 py-2 text-sm font-black transition ${
              isPremium ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300' : 'border-2 border-[#504d43] bg-[#e7dfce] text-[#2d2c27] hover:bg-[#504d43] hover:text-[#ebe4d4]'
            }`}
          >
            <AdminIcon size={17} />
            {adminLabel}
          </NavLink>
        </div>
      </div>
      {menuOpen && (
        <div className={`border-t px-4 py-3 lg:hidden ${
          isPremium ? 'border-emerald-400/15 bg-[#05070b]' : 'border-[#504d43] bg-[#ebe4d4]'
        }`}
        >
          <nav className="grid gap-2">
            <button
              type="button"
              onClick={() => {
                toggleTheme();
                setMenuOpen(false);
              }}
              className={`inline-flex items-center gap-3 rounded px-3 py-3 text-sm font-black transition ${
                isPremium ? 'bg-emerald-400/10 text-emerald-300' : 'border border-[#504d43] bg-[#e7dfce] text-[#2d2c27]'
              }`}
            >
              <Newspaper size={18} />
              Tema: {isPremium ? 'Premium' : 'Classic'}
            </button>
            {[...links, { to: adminTarget, label: adminLabel, icon: AdminIcon }].map(({ to, label, icon: Icon }) => (
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
                        : 'bg-[#504d43] text-[#ebe4d4]'
                      : isPremium
                        ? 'bg-white/[0.03] text-slate-300 hover:bg-emerald-400/10 hover:text-emerald-300'
                        : 'border border-[#504d43] bg-[#e7dfce] text-[#2d2c27] hover:bg-[#d8d2c3]'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
      </header>
      <Outlet />
      <nav className={`fixed bottom-0 left-0 right-0 z-40 border-t lg:hidden ${
        isPremium ? 'border-emerald-400/15 bg-[#05070b]' : 'border-[#504d43] bg-[#ebe4d4]'
      }`}
      >
        <div className="grid grid-cols-7 px-1 py-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex min-w-0 flex-col items-center justify-center gap-1 rounded px-1 py-1.5 text-[0.62rem] font-black transition ${
                  isActive
                    ? isPremium
                      ? 'text-emerald-400'
                      : 'text-[#8f332d]'
                    : isPremium ? 'text-slate-500' : 'text-[#504d43]'
                }`
              }
            >
              <Icon size={19} />
              <span className="max-w-full truncate">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};
