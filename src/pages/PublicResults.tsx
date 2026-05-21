import { CalendarClock, ChevronRight, ListOrdered, Shield, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, asArray, unwrap } from '../api/client';
import { useCardDesign } from '../components/CardDesignProvider';
import { ErrorPanel, PageTitle, Panel } from '../components/ui';
import { SeasonSelector } from '../components/SeasonSelector';
import { Match } from '../types';
import { formatDateTime } from '../utils/date';
import { setSeo } from '../utils/seo';

export const PublicResults = () => {
  const { siteDesign } = useCardDesign();
  const [matches, setMatches] = useState<Match[]>([]);
  const [teamFilter, setTeamFilter] = useState('all');
  const [seasonId, setSeasonId] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    setSeo('Rezultati | Duel Liga', 'Svi odigrani mecevi, pobjednici i rezultat po sezonama.');
    api.get(`/seasons/${seasonId}/matches`).then(unwrap<Match[]>).then((items) => {
      setMatches(asArray(items));
      setError('');
    }).catch((err) => setError(err.response?.data?.message || err.message || 'Backend ili baza nisu dostupni.'));
  }, [seasonId]);

  const teams = Array.from(new Map(asArray(matches).flatMap((match) => [match.homeTeam, match.awayTeam]).filter(Boolean).map((team) => [team.id, team])).values());
  const filteredMatches = asArray(matches).filter((match) => teamFilter === 'all' || String(match.homeTeam.id) === teamFilter || String(match.awayTeam.id) === teamFilter);
  const isPremium = siteDesign === 'premium';

  if (isPremium) {
    const totalGoals = filteredMatches.reduce((sum, match) => sum + Number(match.homeScore || 0) + Number(match.awayScore || 0), 0);
    const biggestWin = filteredMatches.reduce((best, match) => {
      const diff = Math.abs(Number(match.homeScore || 0) - Number(match.awayScore || 0));
      return diff > best ? diff : best;
    }, 0);

    return (
      <main className="min-h-screen bg-[#05070b] px-3 py-5 text-white sm:px-4 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <section className="relative overflow-hidden rounded-md border border-white/10 bg-[#10131b] p-5 sm:p-7">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:54px_54px]" />
            <div className="absolute right-[-8rem] top-[-8rem] h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-400">Rezultati</p>
                <h1 className="mt-2 text-4xl font-black uppercase leading-none tracking-tight text-white sm:text-5xl lg:text-7xl">
                  Match log
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                  Svi odigrani mecevi, rezultat po kolima i pobjednik za izabranu sezonu.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:min-w-[28rem]">
                {[
                  ['Mecevi', filteredMatches.length],
                  ['Golovi', totalGoals],
                  ['Najveca razlika', biggestWin]
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

          <section className="mt-5 rounded-md border border-white/10 bg-[#10131b] p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
              <SeasonSelector value={seasonId} onChange={setSeasonId} />
              <select
                className="rounded-md border border-white/10 bg-[#0b0f17] px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
                value={teamFilter}
                onChange={(event) => setTeamFilter(event.target.value)}
              >
                <option value="all">Sve ekipe</option>
                {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
            </div>
          </section>

          <section className="mt-5">
            <div className="mb-4 flex items-center gap-3">
              <ListOrdered className="text-emerald-400" size={22} />
              <h2 className="text-xl font-black uppercase text-white">Odigrane utakmice</h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredMatches.map((match) => {
                const homeWon = match.winnerTeam?.id === match.homeTeam.id;
                const awayWon = match.winnerTeam?.id === match.awayTeam.id;
                return (
                  <Link
                    key={match.id}
                    to={`/rezultati/${match.id}`}
                    className="group relative overflow-hidden rounded-md border border-white/10 bg-[#10131b] p-4 transition hover:border-emerald-400/40"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-white/20 to-emerald-400 opacity-60" />
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 rounded-md border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.18em] text-emerald-400">
                        <Trophy size={13} />
                        Matchday {match.matchNumber}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[0.68rem] font-bold text-slate-500">
                        <CalendarClock size={13} />
                        {formatDateTime(match.playedAt)}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                      <div className="min-w-0">
                        <div className={`mb-2 grid h-12 w-12 place-items-center rounded-full border text-lg font-black ${
                          homeWon ? 'border-emerald-400 bg-emerald-400 text-slate-950' : 'border-white/10 bg-white/5 text-slate-300'
                        }`}>
                          {match.homeTeam.shortName?.charAt(0) || match.homeTeam.name.charAt(0)}
                        </div>
                        <p className="truncate text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500">{match.homeTeam.shortName}</p>
                        <h3 className="truncate text-lg font-black uppercase text-white">{match.homeTeam.name}</h3>
                      </div>

                      <div className="rounded-md border border-white/10 bg-[#0b0f17] px-4 py-3 text-center shadow-2xl shadow-black/30">
                        <div className="flex items-center gap-3">
                          <span className={`text-4xl font-black ${homeWon ? 'text-emerald-400' : 'text-white'}`}>{match.homeScore}</span>
                          <span className="text-2xl font-black text-slate-600">-</span>
                          <span className={`text-4xl font-black ${awayWon ? 'text-emerald-400' : 'text-white'}`}>{match.awayScore}</span>
                        </div>
                        <p className="mt-1 text-[0.58rem] font-black uppercase tracking-[0.18em] text-slate-500">Kraj</p>
                      </div>

                      <div className="min-w-0 text-right">
                        <div className={`ml-auto mb-2 grid h-12 w-12 place-items-center rounded-full border text-lg font-black ${
                          awayWon ? 'border-emerald-400 bg-emerald-400 text-slate-950' : 'border-white/10 bg-white/5 text-slate-300'
                        }`}>
                          {match.awayTeam.shortName?.charAt(0) || match.awayTeam.name.charAt(0)}
                        </div>
                        <p className="truncate text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500">{match.awayTeam.shortName}</p>
                        <h3 className="truncate text-lg font-black uppercase text-white">{match.awayTeam.name}</h3>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                      <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                        <Shield size={14} />
                        {match.winnerTeam ? `Pobjednik: ${match.winnerTeam.shortName}` : 'Nerijeseno'}
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.14em] text-emerald-400 group-hover:translate-x-1 transition">
                        Detalji <ChevronRight size={15} />
                      </span>
                    </div>
                  </Link>
                );
              })}
              {!filteredMatches.length && !error && (
                <div className="rounded-md border border-white/10 bg-[#10131b] p-5 text-slate-400">Nema rezultata iz backend-a.</div>
              )}
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="px-3 py-5 sm:px-4 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <PageTitle eyebrow="Rezultati" title="Svi odigrani mecevi" />
        {error && <ErrorPanel message={error} />}
        <Panel className="p-3 sm:p-5">
          <div className="mb-5">
            <div className="grid gap-3 sm:flex sm:flex-wrap">
              <SeasonSelector value={seasonId} onChange={setSeasonId} />
              <select className="rounded border border-white/10 bg-blue-950/80 px-3 py-2 text-sm text-white outline-none focus:border-orange-400" value={teamFilter} onChange={(event) => setTeamFilter(event.target.value)}>
                <option value="all">Sve ekipe</option>
                {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-5 flex items-center gap-3 text-orange-300">
            <ListOrdered size={22} />
            <h2 className="text-xl font-black text-white">Match log</h2>
          </div>
          <div className="space-y-4">
            {filteredMatches.map((match) => (
              <Link key={match.id} to={`/rezultati/${match.id}`} className="block rounded-lg border border-white/10 bg-blue-950/70 p-4 transition hover:border-orange-300/50">
                <div className="flex items-center justify-between gap-3">
                  <p className="inline-flex rounded bg-orange-500 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-blue-950">
                    Matchday {match.matchNumber}
                  </p>
                  <p className="text-right text-xs font-bold text-slate-400">{formatDateTime(match.playedAt)}</p>
                </div>

                <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-start gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{match.homeTeam.shortName}</p>
                    <h3 className="mt-1 text-xl font-black leading-tight text-white">{match.homeTeam.name}</h3>
                  </div>
                  <div className="pt-6 text-xs font-black uppercase tracking-[0.16em] text-orange-300">vs</div>
                  <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{match.awayTeam.shortName}</p>
                    <h3 className="mt-1 text-xl font-black leading-tight text-white">{match.awayTeam.name}</h3>
                  </div>
                </div>

                <div className="mt-4 rounded bg-white/10 px-5 py-4 text-center text-5xl font-black leading-none text-white">
                  {match.homeScore}:{match.awayScore}
                </div>

                <p className="mt-3 text-center text-xs font-bold uppercase tracking-[0.16em] text-orange-300">
                  {match.winnerTeam ? `Pobjednik: ${match.winnerTeam.shortName}` : 'Nerijeseno'}
                </p>
              </Link>
            ))}
            {!filteredMatches.length && !error && <p className="text-slate-400">Nema rezultata iz backend-a.</p>}
          </div>
        </Panel>
      </div>
    </main>
  );
};

