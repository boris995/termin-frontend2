import { Flag, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, unwrap } from '../api/client';
import { ErrorPanel, PageTitle, Panel, StatPill } from '../components/ui';
import { DashboardData, Season } from '../types';
import { setSeo } from '../utils/seo';

export const PublicSeasons = () => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setSeo('Sezone | Football Face-Off', 'Pregled sezona, trka do titule i tabela pobjeda.');
    Promise.all([
      api.get('/seasons').then(unwrap<Season[]>),
      api.get('/dashboard/season/1').then(unwrap<DashboardData>)
    ]).then(([seasonData, dashboardData]) => {
      setSeasons(seasonData);
      setDashboard(dashboardData);
      setError('');
    }).catch((err) => setError(err.response?.data?.message || err.message || 'Backend ili baza nisu dostupni.'));
  }, []);

  const active = dashboard?.season || seasons.find((season) => season.status === 'active') || null;
  const teams = dashboard?.teams || [];

  return (
    <main className="px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <PageTitle eyebrow="Sezone" title="Trka do titule" />
        {error && <ErrorPanel message={error} />}
        {active && (
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <StatPill label="Aktivna sezona" value={active.name} />
            <StatPill label="Cilj pobjeda" value={active.winsToWinSeason} />
            <StatPill label="Status" value={active.status} />
          </div>
        )}
        {!active && !error && <Panel className="mb-6">Nema sezona iz backend-a.</Panel>}

        <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <Panel>
            <div className="mb-5 flex items-center gap-3 text-orange-300">
              <Flag size={22} />
              <h2 className="text-xl font-black text-white">Tabela aktivne sezone</h2>
            </div>
            <div className="space-y-4">
              {teams.map((team) => {
                const wins = team.wins || 0;
                const target = active?.winsToWinSeason || 1;
                const pct = Math.min(100, (wins / target) * 100);
                return (
                  <div key={team.id} className="rounded border border-white/10 bg-blue-950/60 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{team.shortName}</p>
                        <h3 className="text-2xl font-black">{team.name}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black">{wins}</p>
                        <p className="text-xs uppercase tracking-widest text-slate-400">pobjeda</p>
                      </div>
                    </div>
                    <div className="h-3 overflow-hidden rounded bg-slate-800">
                      <div className="h-full rounded" style={{ width: `${pct}%`, backgroundColor: team.primaryColor || '#F97316' }} />
                    </div>
                  </div>
                );
              })}
              {!teams.length && <p className="text-slate-400">Nema ekipa iz backend-a.</p>}
            </div>
          </Panel>

          <Panel>
            <div className="mb-5 flex items-center gap-3 text-orange-300">
              <Trophy size={22} />
              <h2 className="text-xl font-black text-white">Arhiva sezona</h2>
            </div>
            <div className="space-y-3">
              {seasons.map((season) => (
                <Link key={season.id} to={`/sezone/${season.id}`} className="block rounded border border-white/10 bg-blue-950/70 p-4 transition hover:border-orange-300/50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black">{season.name}</h3>
                    <span className="rounded bg-white/10 px-2 py-1 text-xs font-bold">#{season.number}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">Igra se do {season.winsToWinSeason} pobjeda.</p>
                  <p className="mt-1 text-sm text-slate-400">Status: {season.status}</p>
                  <p className="mt-3 text-sm font-black text-orange-300">Otvori sezonu</p>
                </Link>
              ))}
              {!seasons.length && <p className="text-slate-400">Nema arhive sezona iz backend-a.</p>}
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
};

