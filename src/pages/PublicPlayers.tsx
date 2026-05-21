import { ChevronRight, Crown, Medal, Search, Shirt, SlidersHorizontal, TrendingUp, UserRound, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, asArray, unwrap } from '../api/client';
import { assetUrl } from '../api/assets';
import { useCardDesign } from '../components/CardDesignProvider';
import { GoldPlayerCard } from '../components/GoldPlayerCard';
import { RetroPlayerTile } from '../components/RetroPlayerTile';
import { SeasonSelector } from '../components/SeasonSelector';
import { ErrorPanel, Panel } from '../components/ui';
import { Player } from '../types';
import { setSeo } from '../utils/seo';

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

const PlayerCard = ({ player }: { player: Player }) => (
  <Link to={`/igraci/${player.id}`} className="block w-full transition hover:-translate-y-1">
    <GoldPlayerCard player={player} />
  </Link>
);

export const PublicPlayers = () => {
  const { siteDesign } = useCardDesign();
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamFilter, setTeamFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [seasonId, setSeasonId] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    setSeo('Igraci | Duel Liga', 'Pregled igraca, kartice, ocjene i statistika.');
    api.get(`/seasons/${seasonId}/players`).then(unwrap<Player[]>).then((items) => {
      setPlayers(asArray(items));
      setError('');
    }).catch((err) => setError(err.response?.data?.message || err.message || 'Backend ili baza nisu dostupni.'));
  }, [seasonId]);

  const filteredPlayers = useMemo(
    () =>
      asArray(players).filter((player) => {
        const teamMatch = teamFilter === 'all' || String(player.teamId) === teamFilter;
        const positionMatch = positionFilter === 'all' || player.position === positionFilter;
        const query = `${player.firstName} ${player.lastName} ${player.nickname || ''} ${player.team?.name || ''}`.toLowerCase();
        const searchMatch = !search.trim() || query.includes(search.trim().toLowerCase());
        return teamMatch && positionMatch && searchMatch;
      }),
    [players, positionFilter, search, teamFilter]
  );
  const teams = useMemo(() => Array.from(new Map(asArray(players).map((player) => [player.teamId, player.team])).values()).filter(Boolean), [players]);
  const topScorers = useMemo(() => [...asArray(players)].sort((a, b) => b.goals - a.goals).slice(0, 5), [players]);
  const topAssists = useMemo(() => [...asArray(players)].sort((a, b) => b.assists - a.assists).slice(0, 5), [players]);
  const isPremium = siteDesign === 'premium';
  const activeTeam = teams.find((team) => team && String(team.id) === teamFilter);
  const activeTeamLabel = activeTeam?.name ? `${activeTeam.name} F.C.` : 'Duel Liga';

  if (isPremium) {
    const topPlayer = [...asArray(players)].sort((a, b) => b.overallRating - a.overallRating)[0];
    const activePlayers = asArray(players).filter((player) => player.goals || player.assists).length;

    return (
      <main className="min-h-screen bg-[#05070b] px-3 py-5 text-white sm:px-4 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-400">Igraci</p>
            <h1 className="mt-2 text-4xl font-black uppercase leading-none tracking-tight text-white sm:text-5xl lg:text-7xl">Roster</h1>
          </header>
          {error && <ErrorPanel message={error} />}

          <section className="rounded-md border border-white/10 bg-[#10131b] p-4">
            <label className="flex items-center gap-3 rounded-md border border-white/10 bg-[#0b0f17] px-3 py-3 text-sm text-slate-400">
              <Search size={18} className="text-emerald-400" />
              <input
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                placeholder="Pretrazi igrace..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <SeasonSelector value={seasonId} onChange={setSeasonId} />
              <select className="rounded-md border border-white/10 bg-[#0b0f17] px-3 py-2 text-sm text-white outline-none focus:border-emerald-400" value={teamFilter} onChange={(event) => setTeamFilter(event.target.value)}>
                <option value="all">Svi timovi</option>
                {teams.map((team) => team && <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
              <select className="rounded-md border border-white/10 bg-[#0b0f17] px-3 py-2 text-sm text-white outline-none focus:border-emerald-400" value={positionFilter} onChange={(event) => setPositionFilter(event.target.value)}>
                <option value="all">Sve pozicije</option>
                <option value="igrac">igrac</option>
                <option value="golman">golman</option>
                <option value="golman-igrac">golman-igrac</option>
              </select>
            </div>
          </section>

          <section className="mt-4 grid grid-cols-2 gap-3 rounded-md border border-white/10 bg-[#10131b] p-4 sm:grid-cols-4">
            {[
              { icon: UserRound, label: 'Ukupno igraca', value: players.length },
              { icon: Shirt, label: 'Timova', value: teams.length },
              { icon: Crown, label: 'Top igrac', value: topPlayer?.overallRating || '-' },
              { icon: TrendingUp, label: 'Aktivnih', value: activePlayers }
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-md border border-white/10 bg-[#0b0f17] p-3 text-center">
                <Icon className="mx-auto text-emerald-400" size={19} />
                <p className="mt-2 text-2xl font-black text-white">{value}</p>
                <p className="mt-1 text-[0.62rem] font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
              </div>
            ))}
          </section>

          <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_24rem]">
            <div className="space-y-2">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-black uppercase text-white">Lista igraca</h2>
                <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-400">
                  <SlidersHorizontal size={15} />
                  Filteri
                </span>
              </div>
              {filteredPlayers.map((player, index) => (
                <Link key={player.id} to={`/igraci/${player.id}`} className="grid grid-cols-[1.15rem_3rem_1fr_auto] items-center gap-2 rounded-md border border-white/10 bg-[#10131b] px-3 py-3 transition hover:border-emerald-400/40 sm:gap-3">
                  <span className="text-center text-[0.7rem] font-black text-emerald-400 sm:text-sm">{index + 1}</span>
                  <img className="h-11 w-11 rounded-full border border-white/10 object-cover" src={assetUrl(playerImage(player))} alt={`${player.firstName} ${player.lastName}`} />
                  <span className="min-w-0">
                    <span className="block truncate font-black text-white">{player.firstName} {player.lastName}</span>
                    <span className="block truncate text-xs text-slate-500">{player.team?.name || 'Ekipa'}</span>
                  </span>
                  <span className="grid grid-cols-[2.5rem_2.5rem_1rem] items-center gap-2 text-right">
                    <span>
                      <span className="block text-sm font-black text-white">{player.goals}</span>
                      <span className="block text-[0.55rem] font-black uppercase tracking-widest text-slate-500">Gol</span>
                    </span>
                    <span>
                      <span className="block text-sm font-black text-white">{player.assists}</span>
                      <span className="block text-[0.55rem] font-black uppercase tracking-widest text-slate-500">Ast</span>
                    </span>
                    <ChevronRight size={17} className="text-emerald-400" />
                  </span>
                </Link>
              ))}
              {!filteredPlayers.length && !error && <div className="rounded-md border border-white/10 bg-[#10131b] p-5 text-slate-400">Nema igraca iz backend-a.</div>}
            </div>

            <aside className="grid gap-5 md:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-md border border-white/10 bg-[#10131b] p-5">
                <div className="mb-4 flex items-center gap-3 text-emerald-400">
                  <Medal size={22} />
                  <h2 className="text-xl font-black text-white">Top strijelci</h2>
                </div>
                {topScorers.map((player, index) => (
                  <Link key={player.id} to={`/igraci/${player.id}`} className="flex items-center justify-between border-b border-white/10 py-3 last:border-b-0">
                    <p className="truncate font-bold text-white">{index + 1}. {player.firstName} {player.lastName}</p>
                    <p className="font-black text-emerald-400">{player.goals} G</p>
                  </Link>
                ))}
              </div>
              <div className="rounded-md border border-white/10 bg-[#10131b] p-5">
                <div className="mb-4 flex items-center gap-3 text-emerald-400">
                  <Users size={22} />
                  <h2 className="text-xl font-black text-white">Top asistenti</h2>
                </div>
                {topAssists.map((player, index) => (
                  <Link key={player.id} to={`/igraci/${player.id}`} className="flex items-center justify-between border-b border-white/10 py-3 last:border-b-0">
                    <p className="truncate font-bold text-white">{index + 1}. {player.firstName} {player.lastName}</p>
                    <p className="font-black text-emerald-400">{player.assists} A</p>
                  </Link>
                ))}
              </div>
            </aside>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#d8d2c3] px-3 py-3 text-[#2d2c27] sm:px-5 lg:px-8">
      <div className="mx-auto max-w-6xl border-x-2 border-[#504d43]/70 px-3 pb-6 sm:px-5 lg:px-7">
        <header className="border-b-4 border-double border-[#504d43] pb-4">
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="flex min-w-0 items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded border-2 border-[#504d43] bg-[#cfc6b5] text-xs font-black">
                DL
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-black uppercase tracking-[0.06em] text-[#2d2c27] sm:text-4xl">Duel Liga</h1>
                <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[#504d43]">Est. 2024</p>
              </div>
            </Link>
            <div className="w-36 shrink-0 sm:w-44">
              <SeasonSelector value={seasonId} onChange={setSeasonId} />
            </div>
          </div>
        </header>
        {error && <ErrorPanel message={error} />}

        <section className="py-6 text-center">
          <div className="flex items-center justify-center gap-3 text-[#8f332d]">
            <span className="text-2xl">★</span>
            <h2 className="text-5xl font-black uppercase tracking-[0.08em] text-[#504d43] sm:text-6xl lg:text-7xl">Igraci</h2>
            <span className="text-2xl">★</span>
          </div>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="h-px w-20 bg-[#504d43]" />
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#8f332d] sm:text-base">{activeTeamLabel}</p>
            <span className="h-px w-20 bg-[#504d43]" />
          </div>
        </section>

        <section className="mb-4 grid grid-cols-2 gap-3">
          <label className="flex min-w-0 items-center gap-2 rounded-none border-2 border-[#504d43] bg-[#e7dfce] px-3 py-3">
            <Search size={17} className="shrink-0 text-[#504d43]" />
            <input
              className="min-w-0 flex-1 bg-transparent text-xs font-black uppercase tracking-[0.08em] text-[#2d2c27] outline-none placeholder:text-[#504d43]"
              placeholder="Filter"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <select
            className="rounded-none border-2 border-[#504d43] bg-[#e7dfce] px-3 py-3 text-xs font-black uppercase tracking-[0.08em] text-[#2d2c27] outline-none"
            value={positionFilter}
            onChange={(event) => setPositionFilter(event.target.value)}
          >
            <option value="all">Pozicija</option>
            <option value="igrac">Igrac</option>
            <option value="golman">Golman</option>
            <option value="golman-igrac">Golman-Igrac</option>
          </select>
          <select
            className="col-span-2 rounded-none border-2 border-[#504d43] bg-[#e7dfce] px-3 py-3 text-xs font-black uppercase tracking-[0.08em] text-[#2d2c27] outline-none sm:col-span-1"
            value={teamFilter}
            onChange={(event) => setTeamFilter(event.target.value)}
          >
            <option value="all">Sve ekipe</option>
            {teams.map((team) => team && <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
          <div className="hidden items-center justify-end gap-2 border-2 border-[#504d43] bg-[#e7dfce] px-3 py-3 text-xs font-black uppercase tracking-[0.08em] text-[#504d43] sm:flex">
            <SlidersHorizontal size={16} />
            {filteredPlayers.length} igraca
          </div>
        </section>

        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-5">
          {filteredPlayers.map((player) => (
            <RetroPlayerTile key={player.id} player={player} />
          ))}
          {!filteredPlayers.length && !error && <Panel className="col-span-full w-full">Nema igraca iz backend-a.</Panel>}
        </div>
      </div>
    </main>
  );
};
