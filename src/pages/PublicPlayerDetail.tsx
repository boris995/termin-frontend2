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

const galleryImages = (value?: string[] | string | null): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value
      .split(/[,\s]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const retroPlayerImage = (player: Player, gallery: string[]) => {
  const image = player.cardImageUrl || gallery[0] || '';
  if (image && !image.includes('/player-assets/player-card.svg') && !image.includes('/player-assets/player-photo.svg')) return assetUrl(image);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 760">
      <defs>
        <filter id="grain">
          <feTurbulence baseFrequency="0.72" numOctaves="3" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer><feFuncA type="table" tableValues="0 0.24"/></feComponentTransfer>
        </filter>
        <linearGradient id="shirt" x1="0" x2="1">
          <stop offset="0" stop-color="#f4eddd"/>
          <stop offset="1" stop-color="#c8bead"/>
        </linearGradient>
      </defs>
      <rect width="620" height="760" fill="#cfc6b5"/>
      <rect width="620" height="760" filter="url(#grain)" opacity="0.45"/>
      <circle cx="310" cy="205" r="108" fill="#2d2c27"/>
      <path d="M112 760c30-250 104-374 198-374s168 124 198 374z" fill="url(#shirt)"/>
      <path d="M200 760c12-160 54-238 110-238s98 78 110 238z" fill="#2d2c27" opacity="0.18"/>
      <circle cx="466" cy="520" r="74" fill="none" stroke="#8f332d" stroke-width="12"/>
      <circle cx="466" cy="520" r="42" fill="none" stroke="#8f332d" stroke-width="5" opacity="0.65"/>
      <path d="M426 520h80M466 480v80" stroke="#8f332d" stroke-width="5" opacity="0.4"/>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const positionTitle = (position: Player['position']) => {
  if (position === 'golman') return 'Golman';
  if (position === 'golman-igrac') return 'Golman-Igrac';
  return 'Igrac';
};

const AttributeScore = ({ value }: { value: number }) => <span className="text-lg font-black leading-none text-[#8f332d]">{value}</span>;

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

  const normalizedGallery = galleryImages(player.galleryImages);
  const gallery = normalizedGallery.length
    ? normalizedGallery
    : ['/player-assets/player-photo.svg?photo=1', '/player-assets/player-photo.svg?photo=2'];
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
    <main className="min-h-screen bg-[#2f2d28] px-3 py-4 text-[#2d2c27] sm:px-5 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-[1.6rem] border-2 border-[#504d43] bg-[#e1d8c7] p-3 shadow-[0_22px_60px_rgba(0,0,0,0.34)] sm:p-5 lg:p-7">
        <div className="rounded-[1.2rem] border-4 border-double border-[#504d43] p-3 sm:p-5">
          <Link to="/igraci" className="mb-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#8f332d] hover:text-[#6f2824]">
            <ArrowLeft size={16} />
            Nazad na igrace
          </Link>

          <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative overflow-hidden border-2 border-[#504d43] bg-[#cfc6b5]">
              <div className="absolute left-4 top-4 z-10 grid h-14 w-14 place-items-center rounded border-2 border-[#504d43] bg-[#e7dfce] text-sm font-black">
                DL
              </div>
              <img
                className="aspect-[4/4.85] w-full object-cover grayscale contrast-125 sepia"
                src={retroPlayerImage(player, gallery)}
                alt={`${player.firstName} ${player.lastName}`}
              />
            </div>

            <div className="flex flex-col justify-center text-center lg:text-left">
              <div className="mb-4 flex items-center justify-center gap-3 text-[#504d43] lg:justify-start">
                <span className="h-px w-16 bg-[#504d43]" />
                <span className="text-sm">★</span>
                <p className="text-sm font-black uppercase tracking-[0.16em]">Duel Liga</p>
                <span className="text-sm">★</span>
                <span className="h-px w-16 bg-[#504d43]" />
              </div>
              <h1 className="text-5xl font-black uppercase leading-[0.92] tracking-[0.03em] text-[#504d43] sm:text-6xl lg:text-7xl">
                {player.firstName}
                <span className="block">{player.lastName}</span>
              </h1>
              {player.nickname && <p className="mt-3 text-sm font-black uppercase tracking-[0.18em] text-[#8f332d]">"{player.nickname}"</p>}
              <div className="mx-auto my-5 flex items-center gap-3 lg:mx-0">
                <span className="text-2xl font-black text-[#504d43]">#</span>
                <span className="text-6xl font-black leading-none text-[#8f332d] sm:text-7xl">{player.shirtNumber}</span>
              </div>
              <p className="mx-auto inline-flex border-y-2 border-[#504d43] bg-[#504d43] px-8 py-2 text-sm font-black uppercase tracking-[0.16em] text-[#e7dfce] lg:mx-0">
                {positionTitle(player.position)}
              </p>
              <div className="mt-6 flex items-center justify-center gap-4 lg:justify-start">
                <div className="grid h-14 w-14 place-items-center rounded border-2 border-[#504d43] bg-[#d8d2c3] text-xs font-black">DL</div>
                <div>
                  <h2 className="text-3xl font-black uppercase text-[#504d43]">{player.team?.name || 'Ekipa'}</h2>
                  <p className="text-sm font-black uppercase tracking-[0.24em] text-[#8f332d]">F.C.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-5 grid grid-cols-2 border-y-2 border-[#504d43] text-center sm:grid-cols-7">
            {[
              ['Broj dresa', player.shirtNumber],
              ['Pozicija', positionTitle(player.position)],
              ['Ekipa', player.team?.shortName || '-'],
              ['Golovi', player.goals],
              ['Asistencije', player.assists],
              ['Publika', player.audienceRating ? player.audienceRating.toFixed(1) : '-'],
              ['FIFA', player.overallRating]
            ].map(([label, value]) => (
              <div key={label} className="border-b border-r border-[#504d43] px-2 py-3 last:border-r-0 sm:border-b-0">
                <p className="text-[0.56rem] font-black uppercase tracking-[0.12em] text-[#504d43]">{label}</p>
                <p className="mt-2 text-sm font-black uppercase text-[#8f332d] sm:text-base">{value}</p>
              </div>
            ))}
          </section>

          <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr_9rem]">
            <div className="border-2 border-[#504d43] bg-[#e7dfce]/55 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span>★</span>
                <h2 className="text-lg font-black uppercase tracking-[0.08em] text-[#504d43]">Statistika</h2>
                <span>★</span>
              </div>
              <div className="space-y-2 text-sm font-black uppercase">
                {[
                  ['Utakmice', latestStats.length],
                  ['Golovi', player.goals],
                  ['Asistencije', player.assists],
                  ['Prosjecna ocjena', (player.overallRating / 10).toFixed(1)]
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 border-b border-[#b8ad9a] pb-1">
                    <span>{label}</span>
                    <span className="text-[#8f332d]">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-2 border-[#504d43] bg-[#e7dfce]/55 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span>★</span>
                <h2 className="text-lg font-black uppercase tracking-[0.08em] text-[#504d43]">Kljucne osobine</h2>
                <span>★</span>
              </div>
              <div className="space-y-2 text-sm font-black uppercase">
                {ratingKeys.map(([label, key]) => (
                  <div key={key} className="flex items-center justify-between gap-4 border-b border-[#b8ad9a] pb-1">
                    <span>{label}</span>
                    <AttributeScore value={player[key]} />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid place-items-center border-2 border-[#504d43] bg-[#d8d2c3] p-3">
              <div className="relative h-40 w-24 border-2 border-[#504d43]">
                <div className="absolute left-1/2 top-0 h-6 w-12 -translate-x-1/2 border-x-2 border-b-2 border-[#504d43]" />
                <div className="absolute bottom-0 left-1/2 h-6 w-12 -translate-x-1/2 border-x-2 border-t-2 border-[#504d43]" />
                <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#8f332d]" />
                <div className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8f332d]/60" />
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-4 lg:grid-cols-[1fr_10rem]">
            <div className="min-h-28 border-2 border-[#504d43] bg-[#e7dfce]/45 p-4">
              <h2 className="text-lg font-black uppercase tracking-[0.08em] text-[#504d43]">Biljeske</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-[#6b665b]">
                {latestStats.length
                  ? `Posljednji upis: ${latestStats[0].goals} golova i ${latestStats[0].assists} asistencija protiv ${opponentName(latestStats[0].teamId, latestStats[0].match)}.`
                  : 'Igrac jos nema upisane nastupe u zavrsenim mecevima.'}
              </p>
            </div>
            <div className="border-2 border-[#504d43] bg-[#e7dfce]/45 p-4 text-center">
              <p className="text-sm font-black uppercase tracking-[0.12em] text-[#504d43]">Kartica #</p>
              <p className="mt-4 text-4xl font-black text-[#8f332d]">{String(player.id).padStart(3, '0')}</p>
              <p className="mt-2 text-[#8f332d]">★ ★ ★</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );

  /*
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
  */
};
