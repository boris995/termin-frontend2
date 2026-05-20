import { ArrowLeft, Star, Trophy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, unwrap } from '../api/client';
import { Button, Panel } from '../components/ui';
import { fallbackMatches } from '../data/fallback';
import { Match } from '../types';
import { formatDateTime } from '../utils/date';
import { setSeo } from '../utils/seo';

const getVoterKey = () => {
  const existing = localStorage.getItem('footballFaceoffVoterKey');
  if (existing) return existing;
  const key = `voter-${crypto.randomUUID()}`;
  localStorage.setItem('footballFaceoffVoterKey', key);
  return key;
};

export const PublicMatchDetail = () => {
  const { id = '1' } = useParams();
  const fallback = useMemo(() => fallbackMatches.find((match) => match.id === Number(id)) || fallbackMatches[0], [id]);
  const [match, setMatch] = useState<Match>(fallback);
  const [selectedRatings, setSelectedRatings] = useState<Record<number, number>>({});
  const [ratedPlayers, setRatedPlayers] = useState<number[]>([]);
  const [message, setMessage] = useState('');

  const load = () => api.get(`/matches/${id}`).then(unwrap<Match>).then(setMatch).catch(() => setMatch(fallback));

  useEffect(() => {
    setSeo(`Matchday ${fallback.matchNumber} | Football Face-Off`, 'Detalji utakmice, rezultat i statistika igraca.');
    load();
    const savedRatings = JSON.parse(localStorage.getItem(`match-${id}-ratings`) || '[]') as number[];
    setRatedPlayers(savedRatings);
  }, [fallback, id]);

  const ratePlayer = async (playerId: number) => {
    const rating = selectedRatings[playerId];
    if (!rating) return setMessage('Izaberi ocjenu od 1 do 10.');
    if (!window.confirm(`Da li si siguran da zelis dati ocjenu ${rating}/10 ovom igracu?`)) return;
    await api.post(`/matches/${match.id}/ratings`, { playerId, rating, voterKey: getVoterKey() });
    const updated = [...ratedPlayers, playerId];
    setRatedPlayers(updated);
    localStorage.setItem(`match-${id}-ratings`, JSON.stringify(updated));
    setMessage('Ocjena je sacuvana.');
    await load();
  };

  const mvpEntry = useMemo(() => {
    const entries = Object.entries(match.ratingSummary || {}).map(([playerId, summary]) => ({ playerId: Number(playerId), average: summary.average, count: summary.count }));
    if (!entries.length) return null;
    const winner = entries.sort((a, b) => b.average - a.average || b.count - a.count)[0];
    const stat = match.playerStats?.find((item) => item.player.id === winner.playerId);
    return stat ? { ...stat, average: winner.average, count: winner.count } : null;
  }, [match.ratingSummary, match.playerStats]);
  const votingEnabled = match.votingEnabled ?? true;

  return (
    <main className="px-3 py-5 sm:px-4 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link to="/rezultati" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-orange-300 hover:text-orange-200">
          <ArrowLeft size={17} />
          Nazad na rezultate
        </Link>
        <Panel className="p-4 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="inline-flex rounded bg-orange-500 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-blue-950">
              Matchday {match.matchNumber}
            </p>
            <p className="text-right text-xs font-bold text-slate-400">{formatDateTime(match.playedAt)}</p>
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{match.homeTeam.shortName}</p>
              <h1 className="mt-1 text-2xl font-black leading-tight text-white md:text-4xl">{match.homeTeam.name}</h1>
            </div>
            <div className="pt-7 text-xs font-black uppercase tracking-[0.16em] text-orange-300">vs</div>
            <div className="text-right">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{match.awayTeam.shortName}</p>
              <h1 className="mt-1 text-2xl font-black leading-tight text-white md:text-4xl">{match.awayTeam.name}</h1>
            </div>
          </div>
          <div className="mt-5 rounded bg-orange-500 px-8 py-5 text-center text-6xl font-black leading-none text-blue-950">
            {match.homeScore}:{match.awayScore}
          </div>
          <p className="mt-4 text-center text-sm text-slate-300">
            {match.winnerTeam ? (
              <>Pobjednik: <span className="font-black text-white">{match.winnerTeam.name}</span></>
            ) : (
              <span className="font-black text-white">Nerijesen mec</span>
            )}
          </p>
        </Panel>

        <Panel className="mt-5 p-5">
          <div className="mb-4 flex items-center gap-3 text-orange-300">
            <Trophy size={24} />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em]">MVP</p>
              <h2 className="text-xl font-black text-white">Igrac utakmice</h2>
            </div>
          </div>
          {mvpEntry ? (
            <div className="rounded border border-orange-300/30 bg-orange-500/10 p-4">
              <p className="text-3xl font-black text-white">{mvpEntry.player.firstName} {mvpEntry.player.lastName}</p>
              <p className="mt-2 text-sm text-slate-300">
                {mvpEntry.team.shortName} - {mvpEntry.goals}G / {mvpEntry.assists}A
              </p>
              <p className="mt-3 inline-flex rounded bg-orange-500 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-blue-950">
                Ocjena {mvpEntry.average.toFixed(1)} / 10 · {mvpEntry.count} {mvpEntry.count === 1 ? 'glas' : 'glasova'}
              </p>
            </div>
          ) : (
            <p className="rounded border border-white/10 bg-blue-950/70 p-4 text-slate-300">MVP jos nije izabran. Glasovi publike ce odrediti igraca utakmice.</p>
          )}
        </Panel>

        <Panel className="mt-5">
          <h2 className="mb-2 text-xl font-black">Glasanje publike</h2>
          <p className="mb-4 text-sm text-slate-400">Registracija nije potrebna. Mozes ocijeniti jednog, vise ili sve igrace. MVP je igrac sa najvecom prosjecnom ocjenom.</p>
          {!votingEnabled && (
            <p className="mb-4 rounded border border-orange-300/30 bg-orange-500/10 p-3 text-sm font-black uppercase tracking-[0.16em] text-orange-100">
              Nema glasanja
            </p>
          )}
          {message && <p className="mb-4 rounded border border-orange-300/30 bg-orange-500/10 p-3 text-sm text-orange-100">{message}</p>}
          <div className="grid gap-3 md:grid-cols-2">
            {match.playerStats?.map((stat, index) => {
              const playerId = stat.player.id;
              const summary = match.ratingSummary?.[playerId];
              const alreadyRated = ratedPlayers.includes(playerId);
              return (
                <div key={`${playerId}-${index}`} className="rounded border border-white/10 bg-blue-950/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black">{stat.player.firstName} {stat.player.lastName}</p>
                      <p className="text-sm text-slate-400">{stat.team.shortName} - {stat.goals}G / {stat.assists}A</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded border border-orange-300/30 bg-orange-500/10 p-4 text-center">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Trenutna ocjena</p>
                    <p className="mt-1 text-5xl font-black leading-none text-white">
                      {summary ? summary.average.toFixed(1) : '-'}
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-300">
                      {summary ? `${summary.count} ${summary.count === 1 ? 'glas' : 'glasova'} za ocjenu` : 'Jos nema ocjena'}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1">
                    {Array.from({ length: 10 }, (_, item) => item + 1).map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        disabled={alreadyRated || !votingEnabled}
                        className={`grid h-8 w-8 place-items-center rounded border text-xs font-black transition ${
                          selectedRatings[playerId] >= rating ? 'border-orange-300 bg-orange-500 text-blue-950' : 'border-white/10 bg-white/10 text-slate-300'
                        } ${alreadyRated || !votingEnabled ? 'cursor-not-allowed opacity-50' : 'hover:border-orange-300'}`}
                        onClick={() => setSelectedRatings((current) => ({ ...current, [playerId]: rating }))}
                        title={`${rating}/10`}
                      >
                        <Star size={14} fill={selectedRatings[playerId] >= rating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {votingEnabled ? (
                      <Button type="button" disabled={alreadyRated} onClick={() => ratePlayer(playerId)}>
                        Sacuvaj ocjenu
                      </Button>
                    ) : (
                      <p className="rounded border border-white/10 bg-slate-950/45 px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-slate-300">
                        Nema glasanja
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {!match.playerStats?.length && <p className="text-slate-400">Nema unesene individualne statistike za ovaj mec.</p>}
          </div>
        </Panel>
      </div>
    </main>
  );
};
