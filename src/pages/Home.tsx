import { CalendarClock, ChevronRight, Newspaper, Shield, Trophy, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, unwrap } from '../api/client';
import { assetUrl } from '../api/assets';
import { GoldPlayerCard } from '../components/GoldPlayerCard';
import { ErrorPanel, Panel } from '../components/ui';
import { HomeData } from '../types';
import { formatDateTime } from '../utils/date';
import { setSeo } from '../utils/seo';

export const Home = () => {
  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setSeo('Football Face-Off | Pocetna', 'Duel Liga rezultati, najave utakmica i novosti.');
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
  const lastMatches = data.lastMatches || (last ? [last] : []);
  const next = data.nextMatch;
  const teams = data.teams || [];
  const featured = data.homeFeaturedPlayers || [];
  const leftTeam = teams[0];
  const rightTeam = teams[1];
  const leftCards = featured.filter((player) => player.teamId === leftTeam?.id).slice(0, 4);
  const rightCards = featured.filter((player) => player.teamId === rightTeam?.id).slice(0, 4);

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
              <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
                {leftCards.map((player) => <GoldPlayerCard key={player.id} player={player} />)}
                {!leftCards.length && <p className="col-span-full rounded border border-white/10 bg-slate-950/45 p-4 text-sm text-slate-300">Admin nije izabrao kartice za {leftTeam?.name || 'prvu ekipu'}.</p>}
              </div>
              <div className="rounded bg-orange-500 px-4 py-3 text-center text-2xl font-black text-blue-950">VS</div>
              <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
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
              <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-300">Football Face-Off</p>
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
            {data.contentBlocks.map((block) => (
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
};
