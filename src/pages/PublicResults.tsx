import { CalendarClock, ChevronRight, ListFilter, ListOrdered, Rows3, Shield, Trophy } from 'lucide-react';
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
    <main className="min-h-screen overflow-x-hidden bg-[#d8d2c3] px-3 py-4 text-[#2d2c27] sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-5 h-px bg-[#2d2c27]" />
        <header className="mb-5 text-center">
          <div className="flex items-center justify-center gap-4 text-[#9b382f] sm:gap-8">
            <span className="text-xl">☆</span>
            <h1 className="text-5xl font-black uppercase leading-none tracking-[0.04em] text-[#2f3030] sm:text-6xl lg:text-7xl">Rezultati</h1>
            <span className="text-xl">☆</span>
          </div>
          <div className="mx-auto mt-3 grid max-w-xl grid-cols-[1fr_auto_1fr] items-center gap-3">
            <span className="h-px bg-[#8d8476]" />
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#9b382f]">Sve utakmice</p>
            <span className="h-px bg-[#8d8476]" />
          </div>
        </header>

        {error && <div className="mb-4"><ErrorPanel message={error} /></div>}

        <section className="mb-4 grid grid-cols-3 gap-2 text-[0.64rem] font-black uppercase tracking-[0.06em] sm:text-sm">
          <button type="button" className="inline-flex items-center justify-center gap-2 rounded-[2px] border-2 border-[#642b26] bg-[#9b382f] px-2 py-3 text-[#f4eddd]">
            <CalendarClock size={15} />
            Sve utakmice
          </button>
          <button type="button" className="inline-flex items-center justify-center gap-2 rounded-[2px] border-2 border-[#504d43] bg-[#e8e0d0] px-2 py-3 text-[#504d43]">
            <Rows3 size={15} />
            Po kolima
          </button>
          <button type="button" className="inline-flex items-center justify-center gap-2 rounded-[2px] border-2 border-[#504d43] bg-[#e8e0d0] px-2 py-3 text-[#504d43]">
            <Shield size={15} />
            Po timovima
          </button>
        </section>

        <section className="mb-4 grid gap-3 md:grid-cols-[1fr_1fr]">
          <div className="classic-results-season">
            <SeasonSelector value={seasonId} onChange={setSeasonId} />
          </div>
          <select
            className="h-12 w-full rounded-[2px] border-2 border-[#504d43] bg-[#e8e0d0] px-4 text-sm font-black uppercase tracking-[0.08em] text-[#2f3030] outline-none focus:border-[#9b382f]"
            value={teamFilter}
            onChange={(event) => setTeamFilter(event.target.value)}
          >
            <option value="all">Sva kola</option>
            {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredMatches.map((match) => (
            <ClassicResultCard key={match.id} match={match} />
          ))}
          {!filteredMatches.length && !error && (
            <p className="rounded-[3px] border-2 border-[#504d43] bg-[#e8e0d0] p-5 text-sm font-bold text-[#504d43] md:col-span-2 xl:col-span-3">
              Nema rezultata iz backend-a.
            </p>
          )}
        </section>

        {filteredMatches.length > 0 && (
          <div className="mt-4 flex justify-center">
            <button type="button" className="inline-flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#504d43]">
              Ucitaj jos <ChevronRight className="rotate-90" size={16} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

const ClassicResultCard = ({ match }: { match: Match }) => {
  const homeWon = match.winnerTeam?.id === match.homeTeam.id;
  const awayWon = match.winnerTeam?.id === match.awayTeam.id;
  const date = new Date(match.playedAt);
  const dateLabel = Number.isNaN(date.getTime())
    ? formatDateTime(match.playedAt)
    : `${date.toLocaleDateString('sr-Latn-BA', { day: '2-digit', month: '2-digit', year: 'numeric' })} | ${date.toLocaleTimeString('sr-Latn-BA', { hour: '2-digit', minute: '2-digit' })}`;

  return (
    <Link
      to={`/rezultati/${match.id}`}
      className="block rounded-[3px] border-2 border-[#504d43] bg-[#e8e0d0] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.32)] transition hover:border-[#9b382f]"
    >
      <div className="text-center">
        <p className="text-sm font-black uppercase tracking-[0.12em] text-[#504d43]">
          <span className={homeWon || awayWon ? 'text-[#9b382f]' : ''}>☆</span> {match.matchNumber}. kolo <span className={homeWon || awayWon ? 'text-[#9b382f]' : ''}>☆</span>
        </p>
        <p className="mt-1 text-[0.68rem] font-black uppercase tracking-[0.06em] text-[#9b382f]">{dateLabel}</p>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <ClassicResultTeam name={match.homeTeam.name} shortName={match.homeTeam.shortName} won={homeWon} />
        <div className="text-center">
          <p className="text-5xl font-black leading-none tracking-[0.02em] text-[#9b382f] sm:text-6xl">{match.homeScore}:{match.awayScore}</p>
          <p className="mt-2 text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#504d43]">{match.status === 'played' ? 'Kraj' : match.status}</p>
        </div>
        <ClassicResultTeam name={match.awayTeam.name} shortName={match.awayTeam.shortName} won={awayWon} />
      </div>
    </Link>
  );
};

const ClassicResultTeam = ({ name, shortName, won }: { name: string; shortName?: string; won: boolean }) => (
  <div className="min-w-0 text-center">
    <div className={`mx-auto grid h-16 w-16 place-items-center rounded-b-[18px] rounded-t-md border-2 border-[#504d43] ${won ? 'bg-[#d7c3b8]' : 'bg-[#d9d0bd]'}`}>
      <div className="grid h-11 w-11 place-items-center rounded-full border-2 border-[#504d43] bg-[#e8e0d0]">
        <span className="text-sm font-black text-[#2f3030]">DL</span>
      </div>
    </div>
    <p className="mt-2 truncate text-lg font-black uppercase leading-none tracking-[0.06em] text-[#2f3030]">{shortName || name}</p>
    <p className="mt-1 truncate text-xs font-black uppercase tracking-[0.08em] text-[#504d43]">F.C.</p>
  </div>
);

