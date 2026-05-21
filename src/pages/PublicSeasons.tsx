import { ChevronRight, Flag, Shield, Target, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, asArray, unwrap } from '../api/client';
import { useCardDesign } from '../components/CardDesignProvider';
import { ErrorPanel, PageTitle, Panel, StatPill } from '../components/ui';
import { DashboardData, Season } from '../types';
import { setSeo } from '../utils/seo';

export const PublicSeasons = () => {
  const { siteDesign } = useCardDesign();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setSeo('Sezone | Duel Liga', 'Pregled sezona, trka do titule i tabela pobjeda.');
    Promise.all([
      api.get('/seasons').then(unwrap<Season[]>),
      api.get('/dashboard/season/1').then(unwrap<DashboardData>)
    ]).then(([seasonData, dashboardData]) => {
      setSeasons(asArray(seasonData));
      setDashboard(dashboardData);
      setError('');
    }).catch((err) => setError(err.response?.data?.message || err.message || 'Backend ili baza nisu dostupni.'));
  }, []);

  const active = dashboard?.season || seasons.find((season) => season.status === 'active') || null;
  const teams = asArray(dashboard?.teams);
  const isPremium = siteDesign === 'premium';

  if (isPremium) {
    return (
      <main className="min-h-screen bg-[#05070b] px-3 py-5 text-white sm:px-4 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <section className="relative overflow-hidden rounded-md border border-white/10 bg-[#10131b] p-5 sm:p-7">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:58px_58px]" />
            <div className="absolute right-[-7rem] top-[-7rem] h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-400">Sezone</p>
                <h1 className="mt-2 text-4xl font-black uppercase leading-none tracking-tight sm:text-5xl lg:text-7xl">Trka do titule</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                  Pregled aktivne sezone, borbe do cilja i arhive svih odigranih sezona.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:min-w-[28rem]">
                {[
                  ['Sezone', seasons.length],
                  ['Timovi', teams.length],
                  ['Cilj', active?.winsToWinSeason || '-']
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border border-white/10 bg-[#0b0f17] p-3 text-center">
                    <p className="text-2xl font-black text-white">{value}</p>
                    <p className="mt-1 text-[0.58rem] font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {error && <div className="mt-5"><ErrorPanel message={error} /></div>}

          {active ? (
            <section className="mt-5 rounded-md border border-white/10 bg-[#10131b] p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-400">Aktivna sezona</p>
                  <h2 className="mt-1 text-2xl font-black uppercase text-white sm:text-3xl">{active.name}</h2>
                </div>
                <Link to={`/sezone/${active.id}`} className="inline-flex items-center gap-1 rounded-md bg-emerald-400 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-950">
                  Otvori <ChevronRight size={15} />
                </Link>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {teams.map((team) => {
                  const wins = team.wins || 0;
                  const pct = Math.min(100, (wins / (active.winsToWinSeason || 1)) * 100);
                  return (
                    <div key={team.id} className="rounded-md border border-white/10 bg-[#0b0f17] p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="grid h-11 w-11 place-items-center rounded-full border border-emerald-400/25 bg-emerald-400/10 text-sm font-black text-emerald-400">
                            {team.shortName?.charAt(0) || team.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-slate-500">{team.shortName}</p>
                            <h3 className="truncate text-xl font-black uppercase text-white">{team.name}</h3>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-black text-emerald-400">{wins}</p>
                          <p className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-slate-500">pobjeda</p>
                        </div>
                      </div>
                      <div className="h-2 overflow-hidden rounded bg-white/10">
                        <div className="h-full rounded bg-emerald-400" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : (
            !error && <div className="mt-5 rounded-md border border-white/10 bg-[#10131b] p-5 text-slate-400">Nema sezona iz backend-a.</div>
          )}

          <section className="mt-5">
            <div className="mb-4 flex items-center gap-3">
              <Trophy className="text-emerald-400" size={22} />
              <h2 className="text-xl font-black uppercase text-white">Arhiva sezona</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {seasons.map((season) => (
                <Link key={season.id} to={`/sezone/${season.id}`} className="group rounded-md border border-white/10 bg-[#10131b] p-5 transition hover:border-emerald-400/40">
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-emerald-400">Sezona #{season.number}</p>
                      <h3 className="mt-2 text-2xl font-black uppercase leading-tight text-white">{season.name}</h3>
                    </div>
                    <span className={`rounded px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.12em] ${
                      season.status === 'active' ? 'bg-emerald-400 text-slate-950' : 'bg-white/10 text-slate-400'
                    }`}>
                      {season.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-md border border-white/10 bg-[#0b0f17] p-3">
                      <Target className="text-emerald-400" size={18} />
                      <p className="mt-2 text-xl font-black">{season.winsToWinSeason}</p>
                      <p className="text-[0.58rem] font-black uppercase tracking-[0.12em] text-slate-500">cilj pobjeda</p>
                    </div>
                    <div className="rounded-md border border-white/10 bg-[#0b0f17] p-3">
                      <Shield className="text-emerald-400" size={18} />
                      <p className="mt-2 text-xl font-black">{season.winnerTeam?.shortName || '-'}</p>
                      <p className="text-[0.58rem] font-black uppercase tracking-[0.12em] text-slate-500">pobjednik</p>
                    </div>
                  </div>
                  <p className="mt-4 inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.16em] text-emerald-400 group-hover:translate-x-1 transition">
                    Otvori sezonu <ChevronRight size={15} />
                  </p>
                </Link>
              ))}
              {!seasons.length && <div className="rounded-md border border-white/10 bg-[#10131b] p-5 text-slate-400">Nema arhive sezona iz backend-a.</div>}
            </div>
          </section>
        </div>
      </main>
    );
  }

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

