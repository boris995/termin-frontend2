import { ArrowLeft, Shield, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, unwrap } from '../api/client';
import { assetUrl } from '../api/assets';
import { useCardDesign } from '../components/CardDesignProvider';
import { GoldPlayerCard } from '../components/GoldPlayerCard';
import { ErrorPanel, Panel } from '../components/ui';
import { Match, Player } from '../types';
import { formatDateTime } from '../utils/date';
import { setSeo } from '../utils/seo';

const ratingKeys = [
  ['PAC', 'pac'],
  ['SHO', 'sho'],
  ['PAS', 'pas'],
  ['DRI', 'dri'],
  ['DEF', 'def'],
  ['PHY', 'phy']
] as const;

export const PublicPlayerDetail = () => {
  const { id = '1' } = useParams();
  const { siteDesign } = useCardDesign();
  const [player, setPlayer] = useState<Player | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setSeo('Profil igraca | Duel Liga', 'Profil igraca, ocjene i galerija.');
    api.get(`/players/${id}`).then(unwrap<Player>).then((data) => {
      setPlayer(data);
      setError('');
      setSeo(`${data.firstName} ${data.lastName} | Duel Liga`, `Profil igraca ${data.firstName} ${data.lastName}, ocjene i galerija.`);
    }).catch((err) => setError(err.response?.data?.message || err.message || 'Backend ili baza nisu dostupni.'));
  }, [id]);

  if (error) {
    return (
      <main className="px-4 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ErrorPanel message={error} />
        </div>
      </main>
    );
  }

  if (!player) {
    return (
      <main className="px-4 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Panel>Ucitavanje igraca iz backend-a...</Panel>
        </div>
      </main>
    );
  }

  const gallery = player.galleryImages?.length ? player.galleryImages : ['/player-assets/player-photo.svg?photo=1', '/player-assets/player-photo.svg?photo=2'];
  const isPremium = siteDesign === 'premium';
  const latestStats = player.matchStats || [];
  const opponentName = (statTeamId: number, match?: Match) => {
    if (!match) return 'Protivnik';
    return match.homeTeam.id === statTeamId ? match.awayTeam.name : match.homeTeam.name;
  };
  const matchResult = (match?: Match) => {
    if (!match) return '-';
    return `${match.homeScore}:${match.awayScore}`;
  };

  if (isPremium) {
    return (
      <main className="min-h-screen bg-[#05070b] px-4 py-6 text-white lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link to="/igraci" className="mb-5 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-emerald-400 hover:text-emerald-300">
            <ArrowLeft size={17} />
            Nazad na igrace
          </Link>

          <section className="relative overflow-hidden rounded-md border border-white/10 bg-[#10131b]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:52px_52px]" />
            <div className="absolute right-0 top-0 h-72 w-72 translate-x-20 -translate-y-24 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="relative grid gap-6 p-4 sm:p-6 lg:grid-cols-[390px_1fr] lg:gap-10 lg:p-8">
              <div className="mx-auto w-full max-w-[330px] sm:max-w-[370px] lg:max-w-none">
                <GoldPlayerCard player={player} large />
              </div>

              <div className="flex min-w-0 flex-col justify-center">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-emerald-400/35 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.22em] text-emerald-400">
                    {player.team?.name || 'Ekipa'}
                  </span>
                  <span className="rounded-md bg-white/10 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.18em] text-slate-300">
                    {player.position}
                  </span>
                </div>
                <h1 className="text-4xl font-black uppercase leading-none tracking-tight text-white sm:text-5xl lg:text-7xl">
                  {player.firstName}
                  <span className="block text-emerald-400">{player.lastName}</span>
                </h1>
                {player.nickname && <p className="mt-3 text-base font-bold text-slate-400">"{player.nickname}"</p>}

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="rounded-md border border-emerald-400/25 bg-emerald-400 px-3 py-4 text-center text-slate-950">
                    <p className="text-3xl font-black">{player.overallRating}</p>
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.16em]">Overall</p>
                  </div>
                  <div className="rounded-md border border-white/10 bg-[#1a1d28] px-3 py-4 text-center">
                    <p className="text-3xl font-black text-white">{player.goals}</p>
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500">Golovi</p>
                  </div>
                  <div className="rounded-md border border-white/10 bg-[#1a1d28] px-3 py-4 text-center">
                    <p className="text-3xl font-black text-white">{player.assists}</p>
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-slate-500">Asist</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-md border border-white/10 bg-[#10131b] p-4 sm:p-6">
              <div className="mb-5 flex items-center gap-3 text-emerald-400">
                <Trophy size={22} />
                <h2 className="text-xl font-black uppercase text-white">Ocjene</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {ratingKeys.map(([label, key]) => (
                  <div key={key} className="rounded-md border border-white/10 bg-[#1a1d28] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-black uppercase tracking-[0.12em] text-slate-300">{label}</p>
                      <p className="text-3xl font-black text-emerald-400">{player[key]}</p>
                    </div>
                    <div className="h-2 overflow-hidden rounded bg-black/40">
                      <div className="h-full rounded bg-emerald-400" style={{ width: `${player[key]}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-white/10 bg-[#10131b] p-4 sm:p-6">
              <div className="mb-5 flex items-center gap-3 text-emerald-400">
                <Shield size={22} />
                <h2 className="text-xl font-black uppercase text-white">Posljednji mecevi</h2>
              </div>
              <div className="space-y-3">
                {latestStats.length ? latestStats.map((stat) => (
                  <Link key={stat.id} to={stat.match ? `/rezultati/${stat.match.id}` : '#'} className="grid gap-3 rounded-md border border-white/10 bg-[#1a1d28] p-4 transition hover:border-emerald-400/40 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">vs {opponentName(stat.teamId, stat.match)}</p>
                      <p className="mt-1 text-sm text-slate-500">{stat.match ? formatDateTime(stat.match.playedAt) : 'Datum nije dostupan'}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded bg-black/25 px-3 py-2">
                        <p className="text-lg font-black text-white">{matchResult(stat.match)}</p>
                        <p className="text-[0.6rem] font-black uppercase tracking-widest text-slate-500">Rez</p>
                      </div>
                      <div className="rounded bg-black/25 px-3 py-2">
                        <p className="text-lg font-black text-white">{stat.goals}</p>
                        <p className="text-[0.6rem] font-black uppercase tracking-widest text-slate-500">Gol</p>
                      </div>
                      <div className="rounded bg-black/25 px-3 py-2">
                        <p className="text-lg font-black text-white">{stat.assists}</p>
                        <p className="text-[0.6rem] font-black uppercase tracking-widest text-slate-500">Ast</p>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <p className="rounded-md border border-white/10 bg-[#1a1d28] p-4 text-sm text-slate-400">Igrac jos nema upisane nastupe u zavrsenim mecevima.</p>
                )}
              </div>
            </div>

            <div className="rounded-md border border-white/10 bg-[#10131b] p-4 sm:p-6">
              <div className="mb-5 flex items-center gap-3 text-emerald-400">
                <Shield size={22} />
                <h2 className="text-xl font-black uppercase text-white">Galerija</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {gallery.map((image, index) => (
                  <img key={image} className="aspect-[4/3] w-full rounded-md border border-white/10 object-cover" src={assetUrl(image)} alt={`${player.firstName} ${player.lastName} ${index + 1}`} />
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link to="/igraci" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-orange-300 hover:text-orange-200">
          <ArrowLeft size={17} />
          Nazad na igrace
        </Link>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <GoldPlayerCard player={player} large />

          <div className="space-y-6">
            <Panel>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">{player.team?.name || 'Ekipa'}</p>
                  <h2 className="mt-2 text-4xl font-black">{player.firstName} {player.lastName}</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded border border-white/10 bg-blue-950/70 px-4 py-3 text-center">
                    <p className="text-2xl font-black">{player.goals}</p>
                    <p className="text-xs uppercase tracking-widest text-slate-400">Golovi</p>
                  </div>
                  <div className="rounded border border-white/10 bg-blue-950/70 px-4 py-3 text-center">
                    <p className="text-2xl font-black">{player.assists}</p>
                    <p className="text-xs uppercase tracking-widest text-slate-400">Asistencije</p>
                  </div>
                </div>
              </div>
            </Panel>

            <Panel>
              <div className="mb-5 flex items-center gap-3 text-orange-300">
                <Shield size={22} />
                <h2 className="text-xl font-black text-white">Posljednji mecevi</h2>
              </div>
              <div className="space-y-3">
                {latestStats.length ? latestStats.map((stat) => (
                  <Link key={stat.id} to={stat.match ? `/rezultati/${stat.match.id}` : '#'} className="grid gap-3 rounded border border-white/10 bg-blue-950/70 p-4 transition hover:border-orange-300/50 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <p className="font-black text-white">vs {opponentName(stat.teamId, stat.match)}</p>
                      <p className="mt-1 text-sm text-slate-400">{stat.match ? formatDateTime(stat.match.playedAt) : 'Datum nije dostupan'}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded bg-slate-950/45 px-3 py-2">
                        <p className="text-lg font-black text-white">{matchResult(stat.match)}</p>
                        <p className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">Rez</p>
                      </div>
                      <div className="rounded bg-slate-950/45 px-3 py-2">
                        <p className="text-lg font-black text-white">{stat.goals}</p>
                        <p className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">Gol</p>
                      </div>
                      <div className="rounded bg-slate-950/45 px-3 py-2">
                        <p className="text-lg font-black text-white">{stat.assists}</p>
                        <p className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">Ast</p>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <p className="rounded border border-white/10 bg-blue-950/70 p-4 text-sm text-slate-300">Igrac jos nema upisane nastupe u zavrsenim mecevima.</p>
                )}
              </div>
            </Panel>

            <Panel>
              <div className="mb-5 flex items-center gap-3 text-orange-300">
                <Trophy size={22} />
                <h2 className="text-xl font-black text-white">Ocjene</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ratingKeys.map(([label, key]) => (
                  <div key={key} className="rounded border border-white/10 bg-blue-950/70 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-black">{label}</p>
                      <p className="text-2xl font-black text-orange-300">{player[key]}</p>
                    </div>
                    <div className="h-2 overflow-hidden rounded bg-slate-800">
                      <div className="h-full rounded bg-orange-500" style={{ width: `${player[key]}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel>
              <div className="mb-5 flex items-center gap-3 text-orange-300">
                <Shield size={22} />
                <h2 className="text-xl font-black text-white">Galerija</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {gallery.map((image, index) => (
                  <img key={image} className="aspect-[4/3] w-full rounded object-cover" src={assetUrl(image)} alt={`${player.firstName} ${player.lastName} ${index + 1}`} />
                ))}
              </div>
            </Panel>
          </div>
        </section>
      </div>
    </main>
  );
};
