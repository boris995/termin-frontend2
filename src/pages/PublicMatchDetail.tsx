import { ArrowLeft, Bell, CalendarClock, MapPin, MessageSquare, Send, Star, Trophy, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, unwrap } from '../api/client';
import { assetUrl } from '../api/assets';
import { useCardDesign } from '../components/CardDesignProvider';
import { Button, ErrorPanel, Panel } from '../components/ui';
import { Match, Player } from '../types';
import { formatDateTime } from '../utils/date';
import { setSeo } from '../utils/seo';

const getVoterKey = () => {
  const existing = localStorage.getItem('footballFaceoffVoterKey');
  if (existing) return existing;
  const key = `voter-${crypto.randomUUID()}`;
  localStorage.setItem('footballFaceoffVoterKey', key);
  return key;
};

const galleryImages = (value?: string[] | string | null) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(/[\s,]+/).map((item) => item.trim()).filter(Boolean);
  return [];
};

const playerImage = (player: Player) => {
  const image = player.cardImageUrl || '';
  if (image && !image.includes('/player-assets/player-card.svg')) return image;
  return galleryImages(player.galleryImages)[0] || '/player-assets/player-photo.svg';
};

export const PublicMatchDetail = () => {
  const { id = '1' } = useParams();
  const { siteDesign } = useCardDesign();
  const [match, setMatch] = useState<Match | null>(null);
  const [selectedRatings, setSelectedRatings] = useState<Record<number, number>>({});
  const [ratedPlayers, setRatedPlayers] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [commentMessage, setCommentMessage] = useState('');
  const [error, setError] = useState('');

  const load = () => api.get(`/matches/${id}`).then(unwrap<Match>).then((data) => {
    setMatch(data);
    setError('');
  }).catch((err) => setError(err.response?.data?.message || err.message || 'Backend ili baza nisu dostupni.'));

  useEffect(() => {
    setSeo('Detalji utakmice | Duel Liga', 'Detalji utakmice, rezultat i statistika igraca.');
    load();
    const savedRatings = JSON.parse(localStorage.getItem(`match-${id}-ratings`) || '[]') as number[];
    setRatedPlayers(savedRatings);
  }, [id]);

  const ratePlayer = async (playerId: number) => {
    const rating = selectedRatings[playerId];
    if (!rating) return setMessage('Izaberi ocjenu od 1 do 10.');
    if (!window.confirm(`Da li si siguran da zelis dati ocjenu ${rating}/10 ovom igracu?`)) return;
    if (!match) return;
    await api.post(`/matches/${match.id}/ratings`, { playerId, rating, voterKey: getVoterKey() });
    const updated = [...ratedPlayers, playerId];
    setRatedPlayers(updated);
    localStorage.setItem(`match-${id}-ratings`, JSON.stringify(updated));
    setMessage('Ocjena je sacuvana.');
    await load();
  };

  const submitComment = async () => {
    const body = commentBody.trim();
    if (!body) return setCommentMessage('Komentar ne moze biti prazan.');
    if (body.length > 255) return setCommentMessage('Komentar moze imati najvise 255 karaktera.');
    if (!match) return;
    await api.post(`/matches/${match.id}/comments`, {
      authorName: commentAuthor.trim() || null,
      body
    });
    setCommentAuthor('');
    setCommentBody('');
    setCommentMessage('Komentar je sacuvan.');
    await load();
  };

  const mvpEntry = useMemo(() => {
    const entries = Object.entries(match?.ratingSummary || {}).map(([playerId, summary]) => ({ playerId: Number(playerId), average: summary.average, count: summary.count }));
    if (!entries.length) return null;
    const winner = entries.sort((a, b) => b.average - a.average || b.count - a.count)[0];
    const stat = match?.playerStats?.find((item) => item.player.id === winner.playerId);
    return stat ? { ...stat, average: winner.average, count: winner.count } : null;
  }, [match?.ratingSummary, match?.playerStats]);
  const votingEnabled = match?.votingEnabled ?? true;
  const isPremium = siteDesign === 'premium';

  if (error) {
    return (
      <main className="px-3 py-5 sm:px-4 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <ErrorPanel message={error} />
        </div>
      </main>
    );
  }

  if (!match) {
    return (
      <main className="px-3 py-5 sm:px-4 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Panel>Ucitavanje utakmice iz backend-a...</Panel>
        </div>
      </main>
    );
  }

  if (isPremium) {
    const stats = match.playerStats || [];
    const homeStats = stats.filter((stat) => stat.team.id === match.homeTeam.id);
    const awayStats = stats.filter((stat) => stat.team.id === match.awayTeam.id);
    const starters = [...homeStats, ...awayStats].slice(0, 10);
    const substitutes = [...homeStats, ...awayStats].slice(10);
    const totalGoals = stats.reduce((sum, stat) => sum + stat.goals, 0);
    const totalAssists = stats.reduce((sum, stat) => sum + stat.assists, 0);
    const averageRatingEntries = Object.values(match.ratingSummary || {});
    const averageRating = averageRatingEntries.length
      ? averageRatingEntries.reduce((sum, item) => sum + item.average, 0) / averageRatingEntries.length
      : 0;
    const topRated = stats.reduce<typeof stats[number] | null>((best, stat) => {
      const rating = match.ratingSummary?.[stat.player.id]?.average || 0;
      const bestRating = best ? match.ratingSummary?.[best.player.id]?.average || 0 : -1;
      return rating > bestRating ? stat : best;
    }, null);

    const fieldSlots = [
      'left-[46%] top-[1%]',
      'left-[14%] top-[21%]',
      'left-[40%] top-[24%]',
      'left-[66%] top-[21%]',
      'left-[7%] top-[43%]',
      'left-[30%] top-[47%]',
      'left-[55%] top-[47%]',
      'left-[78%] top-[43%]',
      'left-[36%] top-[70%]',
      'left-[57%] top-[70%]'
    ];

    const renderPitchPlayer = (stat: typeof stats[number], index: number) => {
      const summary = match.ratingSummary?.[stat.player.id];
      return (
        <Link
          key={`${stat.player.id}-${index}`}
          to={`/igraci/${stat.player.id}`}
          className={`absolute ${fieldSlots[index] || 'left-1/2 top-1/2'} w-16 -translate-x-1/2 text-center sm:w-20`}
        >
          <div className="relative mx-auto h-10 w-10 overflow-hidden rounded-full border border-white/20 bg-slate-900 sm:h-12 sm:w-12">
            <img className="h-full w-full object-cover" src={assetUrl(playerImage(stat.player))} alt={`${stat.player.firstName} ${stat.player.lastName}`} />
            <span className="absolute bottom-0 right-0 grid h-4 min-w-4 place-items-center rounded-full bg-emerald-400 px-1 text-[0.55rem] font-black text-slate-950">
              {summary ? summary.average.toFixed(1) : stat.player.overallRating}
            </span>
          </div>
          <p className="mt-1 truncate text-[0.58rem] font-black text-white sm:text-[0.68rem]">
            {stat.player.shirtNumber}. {stat.player.lastName}
          </p>
        </Link>
      );
    };

    return (
      <main className="min-h-screen bg-[#05070b] px-3 py-4 text-white sm:px-4 lg:px-8">
        <div className="mx-auto max-w-md lg:max-w-6xl">
          <div className="mb-3 flex items-center justify-between">
            <Link to="/rezultati" className="grid h-9 w-9 place-items-center rounded-full text-slate-200 hover:bg-white/10">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-md bg-emerald-400 text-xs font-black text-slate-950">FK</div>
              <span className="text-sm font-black uppercase tracking-wide">Ligaska Zona</span>
            </div>
            <button type="button" className="relative grid h-9 w-9 place-items-center rounded-full text-slate-300 hover:bg-white/10" aria-label="Obavjestenja">
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-400" />
            </button>
          </div>

          <section className="overflow-hidden rounded-md border border-white/10 bg-[#10131b] p-4">
            <p className="text-center text-[0.62rem] font-black uppercase tracking-[0.22em] text-slate-500">Premier Liga BiH - {match.matchNumber}. kolo</p>
            <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div className="text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-rose-500/50 bg-rose-950/35 text-xl font-black text-rose-500">
                  {match.homeTeam.shortName?.charAt(0) || match.homeTeam.name.charAt(0)}
                </div>
                <p className="mt-2 text-[0.72rem] font-black uppercase text-white">{match.homeTeam.shortName || match.homeTeam.name}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-5">
                  <span className="text-5xl font-black text-emerald-400">{match.homeScore}</span>
                  <span className="text-3xl font-black text-slate-500">-</span>
                  <span className="text-5xl font-black text-white">{match.awayScore}</span>
                </div>
                <p className="mt-1 text-[0.62rem] font-black uppercase tracking-[0.22em] text-emerald-400">
                  {match.winnerTeam ? 'Kraj' : 'Nerijeseno'}
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-white/35 bg-white/10 text-xl font-black text-white">
                  {match.awayTeam.shortName?.charAt(0) || match.awayTeam.name.charAt(0)}
                </div>
                <p className="mt-2 text-[0.72rem] font-black uppercase text-white">{match.awayTeam.shortName || match.awayTeam.name}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[0.68rem] text-slate-500">
              <span className="inline-flex items-center gap-1"><CalendarClock size={13} /> {formatDateTime(match.playedAt)}</span>
              <span className="inline-flex items-center gap-1"><MapPin size={13} /> Duel Liga</span>
            </div>
          </section>

          <nav className="mt-4 flex gap-2 overflow-x-auto rounded-md border border-white/10 bg-[#10131b] p-2 text-[0.62rem] font-black uppercase tracking-[0.16em] text-slate-500">
            {['Detalji', 'Sastavi', 'Statistika', 'Tijek', 'Medjusobni susreti'].map((item, index) => (
              <span key={item} className={`shrink-0 rounded px-3 py-2 ${index === 1 ? 'bg-emerald-400 text-slate-950' : 'bg-white/5'}`}>
                {item}
              </span>
            ))}
          </nav>

          <section className="mt-4 rounded-md border border-white/10 bg-[#10131b] p-4">
            <h2 className="text-sm font-black uppercase tracking-[0.1em] text-white">Sastavi i ocjene</h2>
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-md bg-[#0b0f17] p-1">
              <div className="rounded bg-emerald-400/10 py-2 text-center text-[0.68rem] font-black text-emerald-400">{match.homeTeam.shortName || match.homeTeam.name}</div>
              <div className="rounded bg-white/5 py-2 text-center text-[0.68rem] font-black text-slate-300">{match.awayTeam.shortName || match.awayTeam.name}</div>
            </div>
            <div className="mt-3 inline-flex rounded bg-white/5 px-3 py-1 text-[0.62rem] font-black text-slate-300">4-2-3-1</div>
            <div className="relative mt-3 aspect-[8/7] overflow-hidden rounded-md border border-white/10 bg-[#07110f]">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:34px_34px]" />
              <div className="absolute left-1/2 top-0 h-full w-px bg-white/10" />
              <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
              <div className="absolute bottom-[-3rem] left-1/2 h-28 w-44 -translate-x-1/2 rounded-t-full border border-white/10" />
              {starters.map(renderPitchPlayer)}
            </div>

            <div className="mt-4">
              <p className="mb-2 text-[0.68rem] font-black uppercase tracking-[0.18em] text-slate-500">Zamjene</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {(substitutes.length ? substitutes : stats.slice(0, 4)).map((stat) => (
                  <Link key={`sub-${stat.player.id}`} to={`/igraci/${stat.player.id}`} className="flex items-center justify-between rounded-md border border-white/10 bg-[#0b0f17] px-3 py-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="text-[0.65rem] font-black text-emerald-400">{stat.player.shirtNumber}</span>
                      <img className="h-7 w-7 rounded-full object-cover" src={assetUrl(playerImage(stat.player))} alt={`${stat.player.firstName} ${stat.player.lastName}`} />
                      <span className="truncate text-[0.7rem] font-bold text-white">{stat.player.firstName[0]}. {stat.player.lastName}</span>
                    </span>
                    <span className="text-[0.7rem] font-black text-slate-400">{match.ratingSummary?.[stat.player.id]?.average.toFixed(1) || '-'}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-md border border-white/10 bg-[#10131b] p-4">
            <h2 className="text-sm font-black uppercase tracking-[0.1em] text-white">Statistika igraca</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['Golovi', totalGoals],
                ['Asistencije', totalAssists],
                ['Kljucna dodavanja', Math.max(totalAssists * 2, stats.length)],
                ['Prosjecna ocjena', averageRating ? averageRating.toFixed(1) : '-']
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-white/10 bg-[#0b0f17] p-4 text-center">
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="mt-1 text-[0.62rem] font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
                </div>
              ))}
            </div>
            {topRated && (
              <div className="mt-3 rounded-md border border-emerald-400/25 bg-emerald-400/10 p-3 text-sm text-slate-300">
                Najbolje ocijenjen: <span className="font-black text-white">{topRated.player.firstName} {topRated.player.lastName}</span>
                <span className="font-black text-emerald-400"> {match.ratingSummary?.[topRated.player.id]?.average.toFixed(1) || topRated.player.overallRating}</span>
              </div>
            )}
          </section>

          <section className="mt-4 rounded-md border border-white/10 bg-[#10131b] p-4">
            <div className="mb-4 flex items-center gap-3 text-emerald-400">
              <Trophy size={22} />
              <div>
                <p className="text-[0.62rem] font-black uppercase tracking-[0.2em]">MVP</p>
                <h2 className="text-lg font-black text-white">Igrac utakmice</h2>
              </div>
            </div>
            {mvpEntry ? (
              <div className="rounded-md border border-emerald-400/25 bg-emerald-400/10 p-4">
                <p className="text-2xl font-black text-white">{mvpEntry.player.firstName} {mvpEntry.player.lastName}</p>
                <p className="mt-2 text-sm text-slate-400">{mvpEntry.team.shortName} - {mvpEntry.goals}G / {mvpEntry.assists}A</p>
                <p className="mt-3 inline-flex rounded bg-emerald-400 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-slate-950">
                  Ocjena {mvpEntry.average.toFixed(1)} / 10
                </p>
              </div>
            ) : (
              <p className="rounded-md border border-white/10 bg-[#0b0f17] p-4 text-slate-400">MVP jos nije izabran.</p>
            )}
          </section>

          <section className="mt-4 rounded-md border border-white/10 bg-[#10131b] p-4">
            <h2 className="mb-2 text-lg font-black text-white">Glasanje publike</h2>
            {!votingEnabled && <p className="mb-4 rounded-md border border-emerald-400/25 bg-emerald-400/10 p-3 text-sm font-black uppercase tracking-[0.16em] text-emerald-200">Nema glasanja</p>}
            {message && <p className="mb-4 rounded-md border border-emerald-400/25 bg-emerald-400/10 p-3 text-sm text-emerald-100">{message}</p>}
            <div className="grid gap-3 lg:grid-cols-2">
              {stats.map((stat, index) => {
                const playerId = stat.player.id;
                const summary = match.ratingSummary?.[playerId];
                const alreadyRated = ratedPlayers.includes(playerId);
                return (
                  <div key={`${playerId}-${index}`} className="rounded-md border border-white/10 bg-[#0b0f17] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-black text-white">{stat.player.firstName} {stat.player.lastName}</p>
                        <p className="text-sm text-slate-500">{stat.team.shortName} - {stat.goals}G / {stat.assists}A</p>
                      </div>
                      <p className="text-3xl font-black text-emerald-400">{summary ? summary.average.toFixed(1) : '-'}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-1">
                      {Array.from({ length: 10 }, (_, item) => item + 1).map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          disabled={alreadyRated || !votingEnabled}
                          className={`grid h-8 w-8 place-items-center rounded border text-xs font-black transition ${
                            selectedRatings[playerId] >= rating ? 'border-emerald-400 bg-emerald-400 text-slate-950' : 'border-white/10 bg-white/10 text-slate-300'
                          } ${alreadyRated || !votingEnabled ? 'cursor-not-allowed opacity-50' : 'hover:border-emerald-400'}`}
                          onClick={() => setSelectedRatings((current) => ({ ...current, [playerId]: rating }))}
                        >
                          <Star size={14} fill={selectedRatings[playerId] >= rating ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                    {votingEnabled && (
                      <Button type="button" className="mt-4" disabled={alreadyRated} onClick={() => ratePlayer(playerId)}>
                        Sacuvaj ocjenu
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    );
  }

  const comments = match.comments || [];
  const playedAt = new Date(match.playedAt);
  const dateLabel = Number.isNaN(playedAt.getTime())
    ? formatDateTime(match.playedAt)
    : playedAt.toLocaleDateString('sr-Latn-BA', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeLabel = Number.isNaN(playedAt.getTime())
    ? ''
    : playedAt.toLocaleTimeString('sr-Latn-BA', { hour: '2-digit', minute: '2-digit' });

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#d8d2c3] px-3 py-4 text-[#2d2c27] sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-4 space-y-1">
          <div className="h-px bg-[#2d2c27]" />
          <div className="h-px bg-[#2d2c27]" />
        </div>
        <Link to="/rezultati" className="mb-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#9b382f] hover:text-[#6f2824]">
          <ArrowLeft size={15} />
          Sve utakmice
        </Link>

        <section className="rounded-[3px] border-2 border-[#504d43] bg-[#e8e0d0] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.32)] sm:p-6">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
            <span className="h-px bg-[#8d8476]" />
            <p className="text-sm font-black uppercase tracking-[0.12em] text-[#504d43]">☆ {match.matchNumber}. kolo ☆</p>
            <span className="h-px bg-[#8d8476]" />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[0.7rem] font-black uppercase tracking-[0.08em] text-[#504d43]">
            <span className="inline-flex items-center gap-2"><CalendarClock size={14} /> {dateLabel}</span>
            {timeLabel && <span className="inline-flex items-center gap-2"><CalendarClock size={14} /> {timeLabel}</span>}
            <span className="inline-flex items-center gap-2"><Trophy size={14} /> Duel Arena</span>
          </div>

          <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-6">
            <ClassicMatchTeam name={match.homeTeam.name} shortName={match.homeTeam.shortName} />
            <div className="text-center">
              <p className="text-6xl font-black leading-none tracking-[0.02em] text-[#9b382f] sm:text-7xl">{match.homeScore}:{match.awayScore}</p>
              <p className="mt-2 text-sm font-black text-[#504d43]">({Math.max(0, match.homeScore - 1)}:{Math.max(0, match.awayScore - 1)})</p>
              <p className="mt-2 text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#9b382f]">Kraj utakmice</p>
            </div>
            <ClassicMatchTeam name={match.awayTeam.name} shortName={match.awayTeam.shortName} />
          </div>
        </section>

        <nav className="mt-4 grid grid-cols-4 border-b-2 border-[#9b382f] text-center text-[0.62rem] font-black uppercase tracking-[0.08em] text-[#504d43] sm:text-xs">
          {['Detalji', 'MVP', 'Ocjene', 'Komentari'].map((item, index) => (
            <span key={item} className={`px-2 py-3 ${index === 0 ? 'text-[#9b382f]' : ''}`}>{item}</span>
          ))}
        </nav>

        <section className="mt-4 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <article className="rounded-[3px] border-2 border-[#504d43] bg-[#e8e0d0] p-4 sm:p-5">
            <RetroSectionTitle icon={<Trophy size={18} />} title="MVP" />
            {mvpEntry ? (
              <div className="mt-4 text-center">
                <p className="text-3xl font-black uppercase text-[#2f3030]">{mvpEntry.player.firstName} {mvpEntry.player.lastName}</p>
                <p className="mt-2 text-sm font-black uppercase tracking-[0.08em] text-[#504d43]">{mvpEntry.team.name} - {mvpEntry.goals}G / {mvpEntry.assists}A</p>
                <p className="mx-auto mt-4 inline-flex rounded-[2px] border-2 border-[#504d43] bg-[#9b382f] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#f4eddd]">
                  Ocjena {mvpEntry.average.toFixed(1)} / 10 - {mvpEntry.count} {mvpEntry.count === 1 ? 'glas' : 'glasova'}
                </p>
              </div>
            ) : (
              <p className="mt-4 border border-[#b4aa98] bg-[#dfd6c5] p-4 text-sm font-bold text-[#504d43]">MVP jos nije izabran. Glasovi publike ce odrediti igraca utakmice.</p>
            )}
          </article>

          <article className="rounded-[3px] border-2 border-[#504d43] bg-[#e8e0d0] p-4 sm:p-5">
            <RetroSectionTitle icon={<Users size={18} />} title="Statistika utakmice" />
            <div className="mt-4 space-y-2">
              {[
                ['Posjed lopte', '54%', '46%'],
                ['Udarci', Math.max(match.homeScore * 4, 1), Math.max(match.awayScore * 4, 1)],
                ['Udarci u okvir', Math.max(match.homeScore * 2, 0), Math.max(match.awayScore * 2, 0)],
                ['Prekrsaji', 12, 14],
                ['Zuti kartoni', 1, 1],
                ['Crveni kartoni', 0, 0]
              ].map(([label, home, away]) => (
                <div key={label} className="grid grid-cols-[4rem_1fr_4rem] items-center border-b border-[#b4aa98] pb-2 text-center text-xs font-black uppercase text-[#504d43] last:border-b-0">
                  <span className="text-[#9b382f]">{home}</span>
                  <span>{label}</span>
                  <span className="text-[#9b382f]">{away}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-4 rounded-[3px] border-2 border-[#504d43] bg-[#e8e0d0] p-4 sm:p-5">
          <RetroSectionTitle icon={<Star size={18} />} title="Ocjene igraca od strane publike" />
          {!votingEnabled && <p className="mt-4 border border-[#b4aa98] bg-[#dfd6c5] p-3 text-sm font-black uppercase tracking-[0.12em] text-[#9b382f]">Nema glasanja</p>}
          {message && <p className="mt-4 border border-[#b4aa98] bg-[#dfd6c5] p-3 text-sm font-bold text-[#504d43]">{message}</p>}
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {match.playerStats?.map((stat, index) => {
              const playerId = stat.player.id;
              const summary = match.ratingSummary?.[playerId];
              const alreadyRated = ratedPlayers.includes(playerId);
              return (
                <div key={`${playerId}-${index}`} className="border-2 border-[#b4aa98] bg-[#dfd6c5] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-black uppercase text-[#2f3030]">{stat.player.firstName} {stat.player.lastName}</p>
                      <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#504d43]">{stat.team.name} - {stat.goals}G / {stat.assists}A</p>
                    </div>
                    <p className="text-3xl font-black text-[#9b382f]">{summary ? summary.average.toFixed(1) : '-'}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {Array.from({ length: 10 }, (_, item) => item + 1).map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        disabled={alreadyRated || !votingEnabled}
                        className={`grid h-7 w-7 place-items-center border text-[0.65rem] font-black transition ${
                          selectedRatings[playerId] >= rating ? 'border-[#642b26] bg-[#9b382f] text-[#f4eddd]' : 'border-[#8d8476] bg-[#e8e0d0] text-[#504d43]'
                        } ${alreadyRated || !votingEnabled ? 'cursor-not-allowed opacity-50' : 'hover:border-[#9b382f]'}`}
                        onClick={() => setSelectedRatings((current) => ({ ...current, [playerId]: rating }))}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                  {votingEnabled && (
                    <button
                      type="button"
                      disabled={alreadyRated}
                      onClick={() => ratePlayer(playerId)}
                      className="mt-3 w-full rounded-[2px] border-2 border-[#504d43] bg-[#e8e0d0] px-3 py-2 text-xs font-black uppercase tracking-[0.1em] text-[#2f3030] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Sacuvaj ocjenu
                    </button>
                  )}
                </div>
              );
            })}
            {!match.playerStats?.length && <p className="text-sm font-bold text-[#504d43]">Nema unesene individualne statistike za ovaj mec.</p>}
          </div>
        </section>

        <section className="mt-4 rounded-[3px] border-2 border-[#504d43] bg-[#e8e0d0] p-4 sm:p-5">
          <RetroSectionTitle icon={<MessageSquare size={18} />} title="Komentari utakmice" />
          <div className="mt-4 grid gap-3 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="border-2 border-[#b4aa98] bg-[#dfd6c5] p-3">
              <input
                className="h-11 w-full border-2 border-[#8d8476] bg-[#e8e0d0] px-3 text-sm font-bold text-[#2f3030] outline-none focus:border-[#9b382f]"
                placeholder="Ime opcionalno"
                value={commentAuthor}
                maxLength={60}
                onChange={(event) => setCommentAuthor(event.target.value)}
              />
              <textarea
                className="mt-3 min-h-28 w-full resize-none border-2 border-[#8d8476] bg-[#e8e0d0] px-3 py-2 text-sm font-bold text-[#2f3030] outline-none focus:border-[#9b382f]"
                placeholder="Ostavi komentar za ovu utakmicu"
                value={commentBody}
                maxLength={255}
                onChange={(event) => setCommentBody(event.target.value)}
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-xs font-black uppercase tracking-[0.08em] text-[#504d43]">{commentBody.length}/255</span>
                <button
                  type="button"
                  onClick={() => submitComment().catch((err) => setCommentMessage(err.response?.data?.message || err.message || 'Komentar nije sacuvan.'))}
                  className="inline-flex items-center gap-2 rounded-[2px] border-2 border-[#642b26] bg-[#9b382f] px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-[#f4eddd]"
                >
                  <Send size={15} />
                  Posalji
                </button>
              </div>
              {commentMessage && <p className="mt-3 text-sm font-bold text-[#9b382f]">{commentMessage}</p>}
            </div>
            <div className="space-y-3">
              {comments.map((comment) => (
                <article key={comment.id} className="border-2 border-[#b4aa98] bg-[#dfd6c5] p-3">
                  <div className="flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.08em] text-[#504d43]">
                    <span>{comment.authorName || 'Anonimno'}</span>
                    {comment.createdAt && <span>{formatDateTime(comment.createdAt)}</span>}
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-6 text-[#2f3030]">{comment.body}</p>
                </article>
              ))}
              {!comments.length && <p className="border-2 border-[#b4aa98] bg-[#dfd6c5] p-4 text-sm font-bold text-[#504d43]">Jos nema komentara za ovu utakmicu.</p>}
            </div>
          </div>
        </section>
      </div>
    </main>
  );

  return null;
  /*

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
*/
};

const RetroSectionTitle = ({ icon, title }: { icon: ReactNode; title: string }) => (
  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
    <span className="h-px bg-[#8d8476]" />
    <h2 className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-[#504d43]">
      {icon}
      {title}
    </h2>
    <span className="h-px bg-[#8d8476]" />
  </div>
);

const ClassicMatchTeam = ({ name, shortName }: { name: string; shortName?: string }) => (
  <div className="min-w-0 text-center">
    <div className="mx-auto grid h-20 w-20 place-items-center rounded-b-[22px] rounded-t-md border-2 border-[#504d43] bg-[#d9d0bd] sm:h-24 sm:w-24">
      <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-[#504d43] bg-[#e8e0d0] sm:h-16 sm:w-16">
        <span className="text-lg font-black text-[#2f3030]">DL</span>
      </div>
    </div>
    <p className="mt-2 truncate text-xl font-black uppercase leading-none tracking-[0.05em] text-[#2f3030] sm:text-2xl">{shortName || name}</p>
    <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-[#504d43]">F.C.</p>
  </div>
);
