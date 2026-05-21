import { CalendarClock, ChevronRight, Clock, MapPin, Newspaper, Radio, Shield, Star, Trophy, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, asArray, unwrap } from '../api/client';
import { assetUrl } from '../api/assets';
import { useCardDesign } from '../components/CardDesignProvider';
import { GoldPlayerCard } from '../components/GoldPlayerCard';
import { RetroPlayerTile } from '../components/RetroPlayerTile';
import { ErrorPanel, Panel } from '../components/ui';
import { HomeData, NextMatch, Team } from '../types';
import { formatDateTime } from '../utils/date';
import { setSeo } from '../utils/seo';

export const Home = () => {
  const { siteDesign } = useCardDesign();
  const [data, setData] = useState<HomeData | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState('');

  useEffect(() => {
    setSeo('Duel Liga | Pocetna', 'Duel Liga rezultati, najave utakmica i novosti.');
    const loadHome = () => api
      .get('/home')
      .then(unwrap<HomeData>)
      .then((homeData) => {
        setData(homeData);
        setError('');
      })
      .catch((err) => setError(err.response?.data?.message || err.message || 'Backend ili baza nisu dostupni.'));

    loadHome();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (error) {
    return (
      <main className="px-4 py-8 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <ErrorPanel message={error} />
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="px-4 py-8 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Panel>Ucitavanje podataka iz backend-a...</Panel>
        </div>
      </main>
    );
  }

  const last = data.lastMatch;
  const lastMatches = data.lastMatches ? asArray(data.lastMatches) : (last ? [last] : []);
  const next = data.nextMatch;
  const teams = asArray(data.teams);
  const featured = asArray(data.homeFeaturedPlayers);
  const leftTeam = teams[0];
  const rightTeam = teams[1];
  const leftCards = featured.filter((player) => player.teamId === leftTeam?.id).slice(0, 3);
  const rightCards = featured.filter((player) => player.teamId === rightTeam?.id).slice(0, 3);
  const effectiveSiteDesign = siteDesign;
  const totalGoals = lastMatches.reduce((sum, match) => sum + Number(match.homeScore || 0) + Number(match.awayScore || 0), 0);
  const leaderWins = Math.max(...teams.map((team) => Number(team.wins || 0)), 0);
  const topScorers = [...featured].sort((a, b) => Number(b.goals || 0) - Number(a.goals || 0)).slice(0, 3);
  const nextDate = next ? formatDateTime(next.startedAt || next.scheduledAt) : 'Termin nije najavljen';
  const nextTime = next
    ? new Date(next.startedAt || next.scheduledAt).toLocaleTimeString('bs-BA', { hour: '2-digit', minute: '2-digit' })
    : '--:--';
  const teamLabel = (team?: { name?: string | null }) => (team?.name || 'Tim').toUpperCase();
  const homeVersusLabel = next
    ? `${teamLabel(next.homeTeam)} VS ${teamLabel(next.awayTeam)}`
    : `${teamLabel(leftTeam)} VS ${teamLabel(rightTeam)}`;
  const homeCountdown = getHomeCountdown(next?.scheduledAt, now);
  const showClassicHomeIntroSection = Boolean(data.settings?.showClassicHomeIntroSection);

  if (effectiveSiteDesign === 'premium') {
    const teamInitial = (teamName?: string) => (teamName || '?').trim().charAt(0).toUpperCase();

    return (
      <main className="min-h-screen bg-[#05070b] text-white">
        <section className="relative overflow-hidden border-b border-white/10 bg-[#030605]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_8%,rgba(255,255,255,0.28),transparent_12rem),radial-gradient(circle_at_50%_52%,rgba(34,197,94,0.16),transparent_18rem),linear-gradient(135deg,rgba(22,163,74,0.22),transparent_22%),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:auto,auto,auto,64px_64px,64px_64px]" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 to-transparent" />
          <div className="relative mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:py-8 md:grid-cols-[1fr_25rem] md:items-end lg:grid-cols-[1fr_32rem] lg:px-8 lg:py-12">
            <div className="min-w-0">
              <div className="max-w-3xl">
                <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-400">Duel Liga</p>
                <h1 className="mt-2 text-5xl font-black uppercase italic leading-[0.95] tracking-tight text-white drop-shadow-2xl sm:text-7xl lg:text-8xl">
                  {data.season?.name || 'Sezona'}
                </h1>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3 md:max-w-3xl">
                {[
                  { icon: Radio, label: 'Live status', value: next?.status === 'live' ? 'LIVE' : 'Nema live' },
                  { icon: CalendarClock, label: 'Zadnji mecevi', value: lastMatches.length },
                  { icon: Users, label: 'Home kartice', value: featured.length }
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 rounded-md border border-white/10 bg-[#090d0c]/85 p-3 shadow-2xl shadow-black/30 sm:block sm:min-h-[8rem] sm:p-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-emerald-400/20 bg-emerald-400/5 text-emerald-400 sm:h-14 sm:w-14">
                      <Icon size={22} />
                    </div>
                    <div className="min-w-0 sm:mt-3">
                      <p className="text-[0.64rem] font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
                      <p className="mt-1 truncate text-xl font-black text-white sm:text-2xl">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-md border border-emerald-400/35 bg-[#090d0c]/90 p-4 shadow-2xl shadow-black/40 sm:p-5">
              <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
                <div className="text-center">
                  <div className="mx-auto grid aspect-[4/3] w-full max-w-[8rem] place-items-center rounded-t-[35%] border border-white/10 bg-white/5 text-4xl font-black text-white sm:max-w-[9rem] md:max-w-[7.5rem] lg:max-w-[10rem]">
                    {teamInitial(leftTeam?.name)}
                  </div>
                  <p className="mt-3 truncate text-xl font-black uppercase text-white sm:text-2xl">{leftTeam?.shortName || leftTeam?.name || 'Bijeli'}</p>
                </div>
                <div className="pb-6 text-center">
                  <p className="text-4xl font-black italic text-white drop-shadow-xl sm:text-5xl lg:text-6xl">VS</p>
                  <div className="mx-auto mt-3 grid h-9 w-14 place-items-center rounded-full bg-emerald-700 text-base sm:h-11 sm:w-16">⚽</div>
                </div>
                <div className="text-center">
                  <div className="mx-auto grid aspect-[4/3] w-full max-w-[8rem] place-items-center rounded-t-[35%] border border-white/10 bg-black/50 text-4xl font-black text-slate-200 sm:max-w-[9rem] md:max-w-[7.5rem] lg:max-w-[10rem]">
                    {teamInitial(rightTeam?.name)}
                  </div>
                  <p className="mt-3 truncate text-xl font-black uppercase text-white sm:text-2xl">{rightTeam?.shortName || rightTeam?.name || 'Crni'}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:82px_82px]" />
          <div className="absolute left-1/2 top-0 h-full w-[42rem] -translate-x-1/2 bg-emerald-500/5 blur-3xl" />
          <div className="relative mx-auto grid min-h-[438px] max-w-7xl items-center gap-8 px-4 py-16 md:grid-cols-[1fr_1.1fr_1fr] lg:px-8">
            <div className="flex flex-col items-center text-center">
              <div className="grid h-28 w-28 place-items-center rounded-full border-2 border-rose-600 bg-rose-950/45 text-3xl font-black text-rose-500">
                {teamInitial(leftTeam?.name)}
              </div>
              <h1 className="mt-5 text-3xl font-black uppercase tracking-tight text-white md:text-4xl">{leftTeam?.name || 'Domacin'}</h1>
            </div>

            <div className="text-center">
              <div className="mx-auto inline-flex items-center gap-2 rounded-md border border-emerald-400/45 px-4 py-2 text-[0.68rem] font-black uppercase tracking-[0.32em] text-emerald-400">
                <CalendarClock size={13} />
                {next?.status === 'live' ? 'Utakmica uzivo' : 'Sljedeca utakmica'}
              </div>
              <p className="mt-8 text-7xl font-black leading-none text-emerald-400 md:text-8xl">VS</p>
              <p className="mt-3 text-[0.7rem] font-bold uppercase tracking-[0.32em] text-slate-500">{data.season?.name || 'Duel Liga'}</p>
              <p className="mt-2 text-base font-black text-white">{nextDate}</p>
              <p className="mt-2 text-3xl font-black text-emerald-400">{next?.status === 'live' ? 'LIVE' : nextTime}</p>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-5 text-slate-500">{next?.venue || next?.note || 'Lokacija ce biti prikazana kada bude unesena u najavu.'}</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="grid h-28 w-28 place-items-center rounded-full border-2 border-blue-600 bg-blue-950/45 text-3xl font-black text-blue-500">
                {teamInitial(rightTeam?.name)}
              </div>
              <h2 className="mt-5 text-3xl font-black uppercase tracking-tight text-white md:text-4xl">{rightTeam?.name || 'Gost'}</h2>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#1a1d28]">
          <div className="mx-auto grid max-w-7xl divide-y divide-white/10 px-4 md:grid-cols-4 md:divide-x md:divide-y-0 lg:px-8">
            {[
              { icon: CalendarClock, value: lastMatches.length, label: 'Utakmica odigrano' },
              { icon: Trophy, value: totalGoals, label: 'Ukupno golova' },
              { icon: Users, value: featured.length, label: 'Registrovanih igraca' },
              { icon: Star, value: leaderWins, label: 'Pobjeda lider' }
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center justify-center gap-4 py-6 md:justify-start md:px-6">
                <Icon className="text-emerald-400" size={18} />
                <div>
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="text-sm text-slate-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.26em] text-emerald-400">Aktivna sezona</p>
              <h2 className="mt-1 text-3xl font-black uppercase text-white">{data.season?.name || 'Nema aktivne sezone'}</h2>
            </div>
            <Link className="rounded-md border border-emerald-400/35 px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-emerald-400 transition hover:bg-emerald-400 hover:text-slate-950" to={data.season ? `/sezone/${data.season.id}` : '/sezone'}>
              Otvori sezonu
            </Link>
          </div>

          <div className="rounded-md border border-white/10 bg-[#10131b] p-4 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <p className="max-w-full truncate text-center text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                {leftTeam?.name || 'Gornja ekipa'} <span className="px-2 text-emerald-400">|</span> {rightTeam?.name || 'Donja ekipa'}
              </p>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <div className="grid items-center gap-5 lg:grid-cols-[1fr_auto_1fr]">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {leftCards.map((player) => <GoldPlayerCard key={player.id} player={player} />)}
                {!leftCards.length && <p className="col-span-full rounded-md border border-white/10 bg-white/5 p-4 text-sm text-slate-400">Admin nije izabrao kartice za {leftTeam?.name || 'prvu ekipu'}.</p>}
              </div>
              <div className="hidden h-full w-px bg-white/10 lg:block" />
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {rightCards.map((player) => <GoldPlayerCard key={player.id} player={player} />)}
                {!rightCards.length && <p className="col-span-full rounded-md border border-white/10 bg-white/5 p-4 text-sm text-slate-400">Admin nije izabrao kartice za {rightTeam?.name || 'drugu ekipu'}.</p>}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 lg:grid-cols-[1.25fr_0.8fr] lg:px-8">
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-3xl font-black uppercase tracking-tight text-white">Zadnji rezultati</h2>
              <Link className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.2em] text-emerald-400" to="/rezultati">
                Svi <ChevronRight size={14} />
              </Link>
            </div>
            <div className="space-y-2">
              {lastMatches.length ? lastMatches.map((match) => (
                <Link key={match.id} to={`/rezultati/${match.id}`} className="grid items-center gap-4 rounded-md border border-white/10 bg-[#10131b] px-4 py-3 transition hover:border-emerald-400/40 md:grid-cols-[1fr_auto_1fr_auto]">
                  <p className="text-right text-sm font-black uppercase text-white">{match.homeTeam.shortName || match.homeTeam.name}</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="rounded-md bg-emerald-400 px-3 py-2 text-lg font-black text-slate-950">{match.homeScore}</span>
                    <span className="text-slate-600">-</span>
                    <span className="rounded-md bg-[#1b2030] px-3 py-2 text-lg font-black text-white">{match.awayScore}</span>
                  </div>
                  <p className="text-sm font-black uppercase text-slate-500">{match.awayTeam.shortName || match.awayTeam.name}</p>
                  <p className="text-right text-xs leading-5 text-slate-500">{formatDateTime(match.playedAt)}</p>
                </Link>
              )) : (
                <div className="rounded-md border border-white/10 bg-[#10131b] p-5 text-slate-400">Nema odigranih utakmica.</div>
              )}
            </div>
          </div>

          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-3xl font-black uppercase tracking-tight text-white">Strijelci</h2>
              <Link className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.2em] text-emerald-400" to="/igraci">
                Svi <ChevronRight size={14} />
              </Link>
            </div>
            <div className="rounded-md border border-white/10 bg-[#10131b]">
              {topScorers.length ? topScorers.map((player, index) => (
                <Link key={player.id} to={`/igraci/${player.id}`} className="grid grid-cols-[2rem_2.5rem_1fr_auto] items-center gap-3 border-b border-white/10 px-5 py-4 last:border-b-0">
                  <span className={`font-black ${index === 0 ? 'text-emerald-400' : 'text-slate-500'}`}>{index + 1}</span>
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-[0.65rem] font-black text-white">
                    {(player.firstName[0] || '') + (player.lastName[0] || '')}
                  </span>
                  <span>
                    <span className="block font-black text-white">{player.firstName} {player.lastName}</span>
                    <span className="text-sm text-slate-500">{player.team?.name || 'Ekipa'}</span>
                  </span>
                  <span className="text-right">
                    <span className="block text-xl font-black text-white">{player.goals || 0}</span>
                    <span className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">Gol</span>
                  </span>
                </Link>
              )) : (
                <div className="p-5 text-slate-400">Nema izabranih igraca za prikaz strijelaca.</div>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-10 lg:grid-cols-2 lg:px-8">
          <div className="rounded-md border border-white/10 bg-[#10131b] p-6">
            <div className="mb-5 flex items-center gap-3 text-emerald-400">
              <Trophy size={22} />
              <p className="text-sm font-black uppercase tracking-[0.18em]">Rezultat prosle utakmice</p>
            </div>
            {last ? (
              <>
                <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">{last.homeTeam.shortName}</p>
                    <h2 className="mt-2 text-2xl font-black uppercase text-white">{last.homeTeam.name}</h2>
                  </div>
                  <div className="rounded-md border border-white/10 bg-[#1a1d28] px-6 py-4 text-center text-5xl font-black text-emerald-400">
                    {last.homeScore}:{last.awayScore}
                  </div>
                  <div className="md:text-right">
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">{last.awayTeam.shortName}</p>
                    <h2 className="mt-2 text-2xl font-black uppercase text-white">{last.awayTeam.name}</h2>
                  </div>
                </div>
                <p className="mt-5 text-sm text-slate-400">
                  {last.winnerTeam ? (
                    <>Pobjednik: <span className="font-black text-white">{last.winnerTeam.name}</span></>
                  ) : (
                    <span className="font-black text-white">Nerijesen mec</span>
                  )}
                </p>
              </>
            ) : (
              <p className="text-slate-400">Jos nema unesene prethodne utakmice.</p>
            )}
          </div>

          <div className="rounded-md border border-white/10 bg-[#10131b] p-6">
            <div className="mb-5 flex items-center gap-3 text-emerald-400">
              <CalendarClock size={22} />
              <p className="text-sm font-black uppercase tracking-[0.18em]">Najava sljedece utakmice</p>
            </div>
            {next ? (
              <>
                <div className="rounded-md border border-white/10 bg-[#1a1d28] p-5">
                  <p className="text-sm font-bold text-emerald-400">{formatDateTime(next.scheduledAt)}</p>
                  <h2 className="mt-3 text-3xl font-black uppercase text-white">
                    {next.homeTeam.name} vs {next.awayTeam.name}
                  </h2>
                  {next.venue && <p className="mt-3 text-sm text-slate-400">Lokacija: {next.venue}</p>}
                </div>
                {next.note && <p className="mt-4 text-slate-400">{next.note}</p>}
              </>
            ) : (
              <p className="text-slate-400">Sljedeca utakmica jos nije najavljena.</p>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-12 lg:px-8">
          <div className="mb-4 flex items-center gap-3">
            <Newspaper className="text-emerald-400" size={22} />
            <h2 className="text-2xl font-black uppercase text-white">Novosti i sadrzaj</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {asArray(data.contentBlocks).map((block) => (
              <div key={block.id} className="rounded-md border border-white/10 bg-[#10131b] p-5">
                {block.imageUrl && <img className="mb-4 aspect-video w-full rounded-md object-cover" src={block.imageUrl} alt={block.title} />}
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">{block.type}</p>
                <h3 className="mt-2 text-2xl font-black text-white">{block.title}</h3>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-400">{block.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#d8d2c3] px-3 py-5 text-[#2d2c27] lg:px-8">
      <div className="mx-auto max-w-6xl">
        {next && <HomeClassicAnnouncement next={next} countdown={homeCountdown} />}

        {showClassicHomeIntroSection && <section className="mb-6 border-2 border-[#504d43] bg-[#ebe4d4] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)] [background-image:radial-gradient(rgba(45,44,39,0.12)_1px,transparent_1px)] [background-size:7px_7px] md:p-6">
          <div className="flex items-start justify-between gap-4 border-b-4 border-double border-[#504d43] pb-4">
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center border-2 border-[#504d43] bg-[#d8d2c3] text-2xl">⚽</div>
              <div>
                <h1 className="text-3xl font-black uppercase leading-none tracking-wide md:text-4xl">Duel Liga</h1>
                <p className="mt-1 text-[0.65rem] font-black uppercase tracking-[0.28em] text-[#504d43]">Est. 2024 ★★★</p>
              </div>
            </div>
            <Link to={data.season ? `/sezone/${data.season.id}` : '/sezone'} className="shrink-0 border-2 border-[#504d43] bg-[#e2dccd] px-4 py-3 text-xs font-black uppercase tracking-[0.16em] hover:bg-[#504d43] hover:text-[#ebe4d4]">
              Sezona
            </Link>
          </div>

          <div className="py-6 text-center">
            <div className="mb-3 flex items-center gap-3 text-[#504d43]">
              <div className="h-px flex-1 bg-[#504d43]" />
              <span className="text-xl">★</span>
              <div className="h-px flex-1 bg-[#504d43]" />
            </div>
            <h2 className="text-5xl font-black uppercase leading-[0.92] tracking-tight text-[#34332d] md:text-7xl">
              {data.season?.name || 'Sezona'}
            </h2>
            <div className="mt-4 flex items-center gap-3 text-[#504d43]">
              <div className="h-px flex-1 bg-[#504d43]" />
              <span className="text-xl">★</span>
              <div className="h-px flex-1 bg-[#504d43]" />
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-3">
            {[
              { icon: Radio, label: 'Live status', value: next?.status === 'live' ? 'Utakmica je LIVE' : 'Nema live utakmice' },
              { icon: CalendarClock, label: 'Zadnji mecevi', value: lastMatches.length },
              { icon: Users, label: 'Home kartice', value: featured.length }
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="border-2 border-[#504d43] bg-[#e7dfce]/85 p-3">
                <div className="flex items-center gap-3 border-b border-[#7a7466] pb-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#504d43]">
                    <Icon size={18} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.12em]">{label}</p>
                </div>
                <p className="mt-4 text-2xl font-black text-[#8f332d]">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 border-2 border-[#504d43] bg-[#e7dfce]/85 p-4">
            <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
              <span className="h-px bg-[#8d8476]" />
              <p className="max-w-full text-lg font-black uppercase tracking-[0.08em] text-[#8f332d] sm:text-2xl md:text-3xl">{homeVersusLabel}</p>
              <span className="h-px bg-[#8d8476]" />
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-5">
              <HomeClassicTeamBadge team={leftTeam} />
              <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-[#504d43] bg-[#ebe4d4] text-xl font-black text-[#8f332d] sm:h-20 sm:w-20 sm:text-3xl md:h-24 md:w-24">VS</div>
              <HomeClassicTeamBadge team={rightTeam} />
            </div>
          </div>
        </section>}

        <section className="mb-6 border border-neutral-300 bg-[#fafafa] p-4 md:p-6">
          <div className="grid gap-4">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {leftCards.map((player) => <RetroPlayerTile key={player.id} player={player} compact />)}
              {!leftCards.length && <p className="col-span-full border border-neutral-300 bg-white p-4 text-sm text-neutral-600">Admin nije izabrao kartice za {leftTeam?.name || 'prvu ekipu'}.</p>}
            </div>
            <div className="flex items-center gap-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.16em] text-neutral-500">
              <div className="h-px flex-1 bg-neutral-300" />
              <span className="max-w-[75vw] truncate whitespace-nowrap">{homeVersusLabel}</span>
              <div className="h-px flex-1 bg-neutral-300" />
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {rightCards.map((player) => <RetroPlayerTile key={player.id} player={player} compact />)}
              {!rightCards.length && <p className="col-span-full border border-neutral-300 bg-white p-4 text-sm text-neutral-600">Admin nije izabrao kartice za {rightTeam?.name || 'drugu ekipu'}.</p>}
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-3 flex items-center justify-between border-b border-neutral-300 pb-2">
              <h2 className="text-xl font-black uppercase">Posljednji rezultati</h2>
              <Link to="/rezultati" className="text-xs font-black uppercase tracking-[0.14em] text-neutral-600 hover:text-neutral-950">Svi</Link>
            </div>
            <div className="space-y-2">
              {lastMatches.length ? lastMatches.map((match) => (
                <Link key={match.id} to={`/rezultati/${match.id}`} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border border-neutral-300 bg-white px-3 py-3 hover:border-neutral-900">
                  <span className="truncate text-sm font-black uppercase text-neutral-700">{match.homeTeam.shortName}</span>
                  <span className="text-2xl font-black text-neutral-950">{match.homeScore}:{match.awayScore}</span>
                  <span className="truncate text-right text-sm font-black uppercase text-neutral-700">{match.awayTeam.shortName}</span>
                </Link>
              )) : (
                <p className="border border-neutral-300 bg-white p-4 text-neutral-600">Nema odigranih utakmica.</p>
              )}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between border-b border-neutral-300 pb-2">
              <h2 className="text-xl font-black uppercase">Sljedeci duel</h2>
              <Link to="/najava" className="text-xs font-black uppercase tracking-[0.14em] text-neutral-600 hover:text-neutral-950">Detalji</Link>
            </div>
            <div className="border border-neutral-300 bg-white p-4">
              {next ? (
                <>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-500">{next.status === 'live' ? 'Live' : 'Najava'}</p>
                  <h3 className="mt-2 text-2xl font-black uppercase text-neutral-950">{homeVersusLabel}</h3>
                  <p className="mt-3 text-sm font-bold text-neutral-700">{formatDateTime(next.startedAt || next.scheduledAt)}</p>
                  {next.venue && <p className="mt-2 text-sm text-neutral-600">Lokacija: {next.venue}</p>}
                  {next.note && <p className="mt-3 text-sm leading-6 text-neutral-600">{next.note}</p>}
                </>
              ) : (
                <p className="text-neutral-600">Sljedeca utakmica jos nije najavljena.</p>
              )}
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-5 lg:grid-cols-2">
          <div className="border border-neutral-300 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <Trophy size={19} />
              <h2 className="text-lg font-black uppercase">Prosli mec</h2>
            </div>
            {last ? (
              <>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <p className="truncate font-black uppercase text-neutral-700">{last.homeTeam.shortName}</p>
                  <p className="border border-neutral-900 px-4 py-2 text-3xl font-black">{last.homeScore}:{last.awayScore}</p>
                  <p className="truncate text-right font-black uppercase text-neutral-700">{last.awayTeam.shortName}</p>
                </div>
                <p className="mt-4 text-sm text-neutral-600">{last.winnerTeam ? `Pobjednik: ${last.winnerTeam.name}` : 'Nerijesen mec'}</p>
              </>
            ) : (
              <p className="text-neutral-600">Jos nema unesene prethodne utakmice.</p>
            )}
          </div>

          <div className="border border-neutral-300 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <Newspaper size={19} />
              <h2 className="text-lg font-black uppercase">Novosti</h2>
            </div>
            <div className="space-y-3">
              {asArray(data.contentBlocks).slice(0, 2).map((block) => (
                <Link key={block.id} to="/najava" className="block border-b border-neutral-200 pb-3 last:border-b-0 last:pb-0">
                  <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-neutral-500">{block.type}</p>
                  <h3 className="mt-1 text-xl font-black text-neutral-950">{block.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-neutral-600">{block.body}</p>
                </Link>
              ))}
              {!asArray(data.contentBlocks).length && <p className="text-neutral-600">Nema CMS tekstova iz backend-a.</p>}
            </div>
          </div>
        </section>
      </div>
    </main>
  );

  /*
  return (
    <main className="px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="mb-6 flex h-24 items-center justify-between gap-4 overflow-hidden rounded-lg border border-white/10 bg-slate-950/70 px-5 shadow-2xl shadow-black/20 md:px-6">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">Live status</p>
            {next?.status === 'live' ? (
              <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex h-3 w-3 rounded-full bg-red-500 shadow-[0_0_18px_rgba(239,68,68,0.85)]" />
                <h2 className="truncate text-xl font-black text-white md:text-2xl">Utakmica je LIVE</h2>
                <p className="truncate text-sm font-bold text-slate-300">
                  {next.homeTeam.shortName} vs {next.awayTeam.shortName} · pocelo {formatDateTime(next.startedAt || next.scheduledAt)}
                </p>
              </div>
            ) : (
              <h2 className="mt-2 text-xl font-black text-white md:text-2xl">Trenutno nema utakmice u toku</h2>
            )}
          </div>
          <Link
            to="/najava"
            className="inline-flex shrink-0 items-center gap-2 rounded bg-orange-500 px-4 py-2 text-sm font-black text-blue-950 transition hover:bg-orange-400"
          >
            <CalendarClock size={17} />
            Detalji
          </Link>
        </section>

        <section className="mb-8 rounded-lg border border-white/10 bg-blue-950/70 p-5 shadow-2xl shadow-black/20 md:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">Aktivna sezona</p>
              <h2 className="mt-1 text-3xl font-black text-white">{data.season?.name || 'Nema aktivne sezone'}</h2>
            </div>
            <Link className="rounded bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/15" to={data.season ? `/sezone/${data.season.id}` : '/sezone'}>
              Otvori sezonu
            </Link>
          </div>

          <div className="mb-6 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
            {[leftTeam, rightTeam].map((team, index) => (
              <div key={team?.id || index} className={`flex items-center gap-4 ${index === 1 ? 'md:flex-row-reverse md:text-right' : ''}`}>
                {team?.logoUrl ? (
                  <img className="h-16 w-16 rounded border border-white/10 object-cover" src={assetUrl(team.logoUrl)} alt={team.name} />
                ) : (
                  <div className="grid h-16 w-16 place-items-center rounded border border-white/10 bg-white/10 text-xl font-black text-white">
                    {team?.shortName || '?'}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{team?.shortName || 'Tim'}</p>
                  <h3 className="text-2xl font-black text-white">{team?.name || 'Ekipa nije dodata'}</h3>
                </div>
              </div>
            ))}
            <div className="rounded bg-orange-500 px-4 py-3 text-center text-2xl font-black text-blue-950">VS</div>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 text-lg font-black text-white">Posljednji rezultati aktivne sezone</h3>
            {lastMatches.length ? (
              <div className="grid gap-3 md:grid-cols-3">
                {lastMatches.map((match) => (
                  <Link key={match.id} to={`/rezultati/${match.id}`} className="rounded border border-white/10 bg-slate-950/45 p-4 transition hover:border-orange-300/50">
                    <p className="inline-flex rounded bg-orange-500 px-2 py-1 text-xs font-black uppercase tracking-[0.16em] text-blue-950">
                      Matchday {match.matchNumber}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="font-bold text-slate-300">{match.homeTeam.shortName}</span>
                      <span className="text-2xl font-black text-white">{match.homeScore}:{match.awayScore}</span>
                      <span className="font-bold text-slate-300">{match.awayTeam.shortName}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="rounded border border-white/10 bg-slate-950/45 p-4 text-slate-300">Nema odigranih utakmica.</p>
            )}
          </div>

          <div>
            <h3 className="mb-4 text-lg font-black text-white">Home kartice igraca</h3>
            <div className="grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {leftCards.map((player) => <GoldPlayerCard key={player.id} player={player} />)}
                {!leftCards.length && <p className="col-span-full rounded border border-white/10 bg-slate-950/45 p-4 text-sm text-slate-300">Admin nije izabrao kartice za {leftTeam?.name || 'prvu ekipu'}.</p>}
              </div>
              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-white/15" />
                <div className="min-w-0 rounded border border-orange-300/30 bg-orange-500/10 px-3 py-1 text-center text-[0.65rem] font-black uppercase tracking-[0.12em] text-orange-200 sm:text-xs">
                  <span className="inline-block max-w-[7.5rem] truncate align-bottom">{leftTeam?.name || 'Gornja ekipa'}</span>
                  <span className="px-2 text-white/35">|</span>
                  <span className="inline-block max-w-[7.5rem] truncate align-bottom">{rightTeam?.name || 'Donja ekipa'}</span>
                </div>
                <div className="h-px flex-1 bg-white/15" />
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {rightCards.map((player) => <GoldPlayerCard key={player.id} player={player} />)}
                {!rightCards.length && <p className="col-span-full rounded border border-white/10 bg-slate-950/45 p-4 text-sm text-slate-300">Admin nije izabrao kartice za {rightTeam?.name || 'drugu ekipu'}.</p>}
              </div>
            </div>
          </div>
        </section>

        <section className="relative mb-8 overflow-hidden rounded-lg border border-white/10 bg-blue-950/70 px-5 py-8 shadow-2xl shadow-black/30 md:px-8 lg:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_25%,rgba(249,115,22,0.30),transparent_30rem)]" />
          <div className="absolute bottom-0 right-0 h-56 w-56 translate-x-16 translate-y-16 rounded-full border border-orange-300/20" />
          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-300">Duel Liga</p>
              <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-white md:text-6xl">
                {next?.status === 'live' ? 'Mec je u toku' : 'Najava sledeceg meca'}
              </h1>
              {next ? (
                <div className="mt-5 max-w-2xl">
                  <p className="inline-flex items-center gap-2 rounded border border-orange-300/25 bg-orange-500/10 px-3 py-2 text-sm font-black text-orange-200">
                    <CalendarClock size={17} />
                    {next.status === 'live' ? `Pocelo: ${formatDateTime(next.startedAt || next.scheduledAt)}` : formatDateTime(next.scheduledAt)}
                  </p>
                  <p className="mt-4 text-2xl font-black text-white md:text-3xl">
                    {next.homeTeam.name} vs {next.awayTeam.name}
                  </p>
                  <p className="mt-3 text-base leading-7 text-slate-300">
                    {next.status === 'live' ? 'Utakmica traje dok admin ne objavi rezultat. ' : ''}
                    {next.venue ? `Lokacija: ${next.venue}. ` : ''}
                    {next.note || `${data.season?.name || 'Duel Liga'} se igra do ${data.season?.winsToWinSeason || 8} pobjeda.`}
                  </p>
                </div>
              ) : (
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                  Sljedeci mec jos nije najavljen. Cim se doda u CMS-u, ovdje ce se prikazati datum, ekipe i detalji utakmice.
                </p>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link className="inline-flex items-center gap-2 rounded bg-orange-500 px-5 py-3 text-sm font-black text-blue-950 transition hover:bg-orange-400" to="/igraci">
                  <Users size={18} />
                  Igraci
                  <ChevronRight size={18} />
                </Link>
                <Link className="inline-flex items-center gap-2 rounded border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15" to="/ekipe">
                  <Shield size={18} />
                  Ekipe
                </Link>
                <Link className="inline-flex items-center gap-2 rounded border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15" to="/najava">
                  Detaljna najava
                </Link>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-slate-950/55 p-5">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">{next?.status === 'live' ? 'Mec u toku' : 'Najava sledeceg meca'}</p>
              {next ? (
                <>
                  <p className="mt-4 inline-flex items-center gap-2 rounded bg-orange-500 px-3 py-2 text-sm font-black text-blue-950">
                    <CalendarClock size={17} />
                    {next.status === 'live' ? `Pocelo: ${formatDateTime(next.startedAt || next.scheduledAt)}` : formatDateTime(next.scheduledAt)}
                  </p>
                  <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-400">{next.homeTeam.shortName}</p>
                      <h2 className="mt-1 text-2xl font-black">{next.homeTeam.name}</h2>
                    </div>
                    <div className="rounded border border-white/10 bg-blue-950 px-4 py-3 text-2xl font-black text-orange-300">
                      VS
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400">{next.awayTeam.shortName}</p>
                      <h2 className="mt-1 text-2xl font-black">{next.awayTeam.name}</h2>
                    </div>
                  </div>
                  {next.venue && (
                    <p className="mt-5 text-sm text-slate-300">
                      Lokacija: <span className="font-black text-white">{next.venue}</span>
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-4 text-slate-300">Sljedeca utakmica jos nije najavljena.</p>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <Panel className="p-6">
            <div className="mb-5 flex items-center gap-3 text-orange-300">
              <Trophy size={22} />
              <p className="text-sm font-black uppercase tracking-[0.18em]">Rezultat prosle utakmice</p>
            </div>
            {last ? (
              <>
                <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">{last.homeTeam.shortName}</p>
                    <h2 className="mt-2 text-3xl font-black">{last.homeTeam.name}</h2>
                  </div>
                  <div className="rounded border border-white/10 bg-blue-950 px-6 py-4 text-center text-5xl font-black">
                    {last.homeScore}:{last.awayScore}
                  </div>
                  <div className="md:text-right">
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">{last.awayTeam.shortName}</p>
                    <h2 className="mt-2 text-3xl font-black">{last.awayTeam.name}</h2>
                  </div>
                </div>
                <p className="mt-5 text-sm text-slate-300">
                  {last.winnerTeam ? (
                    <>Pobjednik: <span className="font-black text-white">{last.winnerTeam.name}</span></>
                  ) : (
                    <span className="font-black text-white">Nerijesen mec</span>
                  )}
                </p>
              </>
            ) : (
              <p className="text-slate-300">Jos nema unesene prethodne utakmice.</p>
            )}
          </Panel>

          <Panel className="p-6">
            <div className="mb-5 flex items-center gap-3 text-orange-300">
              <CalendarClock size={22} />
              <p className="text-sm font-black uppercase tracking-[0.18em]">Najava sljedece utakmice</p>
            </div>
            {next ? (
              <>
                <div className="rounded border border-white/10 bg-blue-950/70 p-5">
                  <p className="text-sm font-bold text-orange-300">{formatDateTime(next.scheduledAt)}</p>
                  <h2 className="mt-3 text-3xl font-black">
                    {next.homeTeam.name} vs {next.awayTeam.name}
                  </h2>
                  {next.venue && <p className="mt-3 text-sm text-slate-300">Lokacija: {next.venue}</p>}
                </div>
                {next.note && <p className="mt-4 text-slate-300">{next.note}</p>}
              </>
            ) : (
              <p className="text-slate-300">Sljedeca utakmica jos nije najavljena.</p>
            )}
          </Panel>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center gap-3">
            <Newspaper className="text-orange-300" size={22} />
            <h2 className="text-2xl font-black">Novosti i sadrzaj</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {asArray(data.contentBlocks).map((block) => (
              <Panel key={block.id}>
                {block.imageUrl && <img className="mb-4 aspect-video w-full rounded object-cover" src={block.imageUrl} alt={block.title} />}
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-300">{block.type}</p>
                <h3 className="mt-2 text-2xl font-black">{block.title}</h3>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-300">{block.body}</p>
              </Panel>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
  */
};

const HomeClassicTeamBadge = ({ team }: { team?: Team }) => (
  <div className="min-w-0 text-center">
    <p className="mb-2 truncate text-base font-black uppercase tracking-wide sm:mb-3 sm:text-2xl md:text-3xl">{team?.name || 'Tim'}</p>
    <div className="mx-auto grid aspect-[4/3] w-full max-w-[7.5rem] place-items-center border-2 border-[#504d43] bg-[#d8d2c3] text-2xl font-black sm:max-w-[12rem] sm:text-4xl md:max-w-[14rem] md:text-5xl">
      {team?.logoUrl ? (
        <img className="h-full w-full object-cover grayscale" src={assetUrl(team.logoUrl)} alt={team.name} />
      ) : (
        <span className="max-w-full truncate px-2">{team?.name || '?'}</span>
      )}
    </div>
  </div>
);

const HomeClassicAnnouncement = ({ next, countdown }: { next: NextMatch; countdown: ReturnType<typeof getHomeCountdown> }) => {
  const scheduled = new Date(next.scheduledAt);
  const date = Number.isNaN(scheduled.getTime())
    ? '--.--.----'
    : scheduled.toLocaleDateString('sr-Latn-BA', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = Number.isNaN(scheduled.getTime())
    ? '--:--'
    : scheduled.toLocaleTimeString('sr-Latn-BA', { hour: '2-digit', minute: '2-digit' });

  return (
    <section className="mb-6">
      <header className="mb-5 text-center">
        <div className="flex items-center justify-center gap-4 text-[#9b382f] sm:gap-8">
          <span className="text-xl">★</span>
          <h1 className="text-5xl font-black uppercase leading-none tracking-[0.08em] text-[#2f3030] sm:text-6xl lg:text-7xl">Najava</h1>
          <span className="text-xl">★</span>
        </div>
        <div className="mx-auto mt-3 grid max-w-xl grid-cols-[1fr_auto_1fr] items-center gap-3">
          <span className="h-px bg-[#8d8476]" />
          <p className="text-sm font-black uppercase tracking-[0.24em] text-[#9b382f]">Utakmice</p>
          <span className="h-px bg-[#8d8476]" />
        </div>
      </header>

      <div className="rounded-[18px] border-2 border-[#504d43] bg-[#e8e0d0] p-3 shadow-[inset_0_0_0_2px_rgba(80,77,67,0.25)] sm:p-5 lg:p-7">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
          <span className="h-px bg-[#8d8476]" />
          <p className="text-sm font-black uppercase tracking-[0.12em] text-[#504d43]">
            ★ Duel Liga - {next.season?.number ? `${next.season.number}. sezona` : 'Sljedece kolo'} ★
          </p>
          <span className="h-px bg-[#8d8476]" />
        </div>

        <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-5">
          <HomeAnnouncementTeam team={next.homeTeam} tone="light" />
          <div className="text-center">
            <span className="mx-auto mb-3 block h-px w-12 bg-[#8d8476] sm:w-16" />
            <p className="text-5xl font-black uppercase leading-none tracking-[0.03em] text-[#9b382f] sm:text-6xl lg:text-7xl">VS</p>
            <span className="mx-auto mt-3 block h-px w-12 bg-[#8d8476] sm:w-16" />
          </div>
          <HomeAnnouncementTeam team={next.awayTeam} tone="dark" />
        </div>

        <div className="mt-6 grid border-2 border-[#b4aa98] text-center sm:grid-cols-3">
          <HomeMatchFact icon={<CalendarClock size={22} />} label="Datum" value={date} />
          <HomeMatchFact icon={<Clock size={22} />} label={next.status === 'live' ? 'Pocelo' : 'Vrijeme'} value={next.status === 'live' ? formatDateTime(next.startedAt || next.scheduledAt) : time} />
          <HomeMatchFact icon={<MapPin size={22} />} label="Stadion" value={next.venue || 'Duel Arena'} />
        </div>

        <div className="my-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
          <span className="h-px bg-[#8d8476]" />
          <p className="text-sm font-black uppercase tracking-[0.12em] text-[#504d43]">★ Pocetak utakmice za ★</p>
          <span className="h-px bg-[#8d8476]" />
        </div>
        <div className="grid grid-cols-4 border-2 border-[#b4aa98] text-center">
          <HomeCountdownBox value={countdown.days} label="Dana" />
          <HomeCountdownBox value={countdown.hours} label="Sati" />
          <HomeCountdownBox value={countdown.minutes} label="Minuta" />
          <HomeCountdownBox value={countdown.seconds} label="Sekundi" />
        </div>
      </div>
    </section>
  );
};

const HomeAnnouncementTeam = ({ team, tone }: { team: Team; tone: 'light' | 'dark' }) => (
  <div className="min-w-0 text-center">
    <div className={`mx-auto grid h-20 w-20 place-items-center rounded-b-[24px] rounded-t-md border-2 border-[#504d43] ${tone === 'dark' ? 'bg-[#393934]' : 'bg-[#d9d0bd]'} sm:h-28 sm:w-28`}>
      <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-[#504d43] bg-[#e8e0d0] sm:h-20 sm:w-20">
        <span className="text-lg font-black tracking-tight text-[#2f3030] sm:text-2xl">DL</span>
      </div>
    </div>
    <h2 className="mt-3 truncate text-xl font-black uppercase tracking-[0.06em] text-[#2f3030] sm:text-3xl">{team.name}</h2>
    <p className="mt-1 truncate text-xs font-black uppercase tracking-[0.18em] text-[#9b382f]">{team.name}</p>
    <p className="mt-2 text-sm text-[#2f3030]">★★★★★</p>
  </div>
);

const HomeMatchFact = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <div className="border-b border-[#b4aa98] p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
    <div className="mx-auto grid h-8 w-8 place-items-center text-[#504d43]">{icon}</div>
    <p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-[#504d43]">{label}</p>
    <p className="mt-1 break-words text-sm font-black uppercase text-[#9b382f] sm:text-base">{value}</p>
  </div>
);

const HomeCountdownBox = ({ value, label }: { value: number; label: string }) => (
  <div className="border-r border-[#b4aa98] p-3 last:border-r-0 sm:p-5">
    <p className="text-3xl font-black leading-none text-[#9b382f] sm:text-5xl">{String(value).padStart(2, '0')}</p>
    <p className="mt-2 text-[0.66rem] font-black uppercase tracking-[0.08em] text-[#504d43] sm:text-sm">{label}</p>
  </div>
);

const getHomeCountdown = (dateValue?: string, now = Date.now()) => {
  const target = dateValue ? new Date(dateValue).getTime() : Date.now();
  const diff = Math.max(target - now, 0);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1_000);
  return { days, hours, minutes, seconds };
};
