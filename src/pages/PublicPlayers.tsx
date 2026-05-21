import { Medal, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, unwrap } from '../api/client';
import { GoldPlayerCard } from '../components/GoldPlayerCard';
import { SeasonSelector } from '../components/SeasonSelector';
import { ErrorPanel, Panel } from '../components/ui';
import { Player } from '../types';
import { setSeo } from '../utils/seo';

const PlayerCard = ({ player }: { player: Player }) => (
  <Link to={`/igraci/${player.id}`} className="block w-full max-w-[360px] transition hover:-translate-y-1">
    <GoldPlayerCard player={player} className="max-w-[360px]" />
  </Link>
);

export const PublicPlayers = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamFilter, setTeamFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [seasonId, setSeasonId] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    setSeo('Igraci | Football Face-Off', 'Pregled igraca, FIFA-style kartice, ocjene i statistika.');
    api.get(`/seasons/${seasonId}/players`).then(unwrap<Player[]>).then((items) => {
      setPlayers(items);
      setError('');
    }).catch((err) => setError(err.response?.data?.message || err.message || 'Backend ili baza nisu dostupni.'));
  }, [seasonId]);

  const filteredPlayers = useMemo(
    () =>
      players.filter((player) => {
        const teamMatch = teamFilter === 'all' || String(player.teamId) === teamFilter;
        const positionMatch = positionFilter === 'all' || player.position === positionFilter;
        return teamMatch && positionMatch;
      }),
    [players, positionFilter, teamFilter]
  );
  const teams = useMemo(() => Array.from(new Map(players.map((player) => [player.teamId, player.team])).values()).filter(Boolean), [players]);
  const topScorers = useMemo(() => [...players].sort((a, b) => b.goals - a.goals).slice(0, 5), [players]);
  const topAssists = useMemo(() => [...players].sort((a, b) => b.assists - a.assists).slice(0, 5), [players]);

  return (
    <main className="px-4 py-4 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">Igraci</p>
            <h1 className="mt-1 text-3xl font-black text-white md:text-4xl">Kartice igraca</h1>
          </div>
          <SeasonSelector value={seasonId} onChange={setSeasonId} />
        </header>
        {error && <ErrorPanel message={error} />}

        <div className="mb-8 grid grid-cols-2 justify-items-center gap-3 sm:gap-5 lg:grid-cols-3 xl:gap-6">
          {filteredPlayers.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
          {!filteredPlayers.length && !error && <Panel className="col-span-full w-full">Nema igraca iz backend-a.</Panel>}
        </div>

        <Panel className="mb-6">
          <div className="grid gap-3 md:grid-cols-2">
            <select className="rounded border border-white/10 bg-blue-950/80 px-3 py-2 text-sm text-white outline-none focus:border-orange-400" value={teamFilter} onChange={(event) => setTeamFilter(event.target.value)}>
              <option value="all">Sve ekipe</option>
              {teams.map((team) => team && <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
            <select className="rounded border border-white/10 bg-blue-950/80 px-3 py-2 text-sm text-white outline-none focus:border-orange-400" value={positionFilter} onChange={(event) => setPositionFilter(event.target.value)}>
              <option value="all">Sve pozicije</option>
              <option value="igrac">igrac</option>
              <option value="golman">golman</option>
              <option value="golman-igrac">golman-igrac</option>
            </select>
          </div>
        </Panel>

        <div className="mb-5 grid gap-5 lg:grid-cols-2">
          <Panel>
            <div className="mb-4 flex items-center gap-3 text-orange-300">
              <Medal size={22} />
              <h2 className="text-xl font-black text-white">Top strijelci</h2>
            </div>
            {topScorers.map((player, index) => (
              <Link key={player.id} to={`/igraci/${player.id}`} className="flex items-center justify-between border-b border-white/10 py-3 last:border-b-0">
                <p className="font-bold">{index + 1}. {player.firstName} {player.lastName}{player.nickname ? ` (${player.nickname})` : ''}</p>
                <p className="font-black text-orange-300">{player.goals} G</p>
              </Link>
            ))}
          </Panel>
          <Panel>
            <div className="mb-4 flex items-center gap-3 text-orange-300">
              <Users size={22} />
              <h2 className="text-xl font-black text-white">Top asistenti</h2>
            </div>
            {topAssists.map((player, index) => (
              <Link key={player.id} to={`/igraci/${player.id}`} className="flex items-center justify-between border-b border-white/10 py-3 last:border-b-0">
                <p className="font-bold">{index + 1}. {player.firstName} {player.lastName}{player.nickname ? ` (${player.nickname})` : ''}</p>
                <p className="font-black text-orange-300">{player.assists} A</p>
              </Link>
            ))}
          </Panel>
        </div>

        <Panel className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="text-xs uppercase tracking-widest text-slate-400">
              <tr>
                <th className="pb-3">#</th>
                <th className="pb-3">Igrac</th>
                <th className="pb-3">Ekipa</th>
                <th className="pb-3">Pozicija</th>
                <th className="pb-3 text-right">OVR</th>
                <th className="pb-3 text-right">Golovi</th>
                <th className="pb-3 text-right">Asistencije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredPlayers.map((player) => (
                <tr key={player.id}>
                  <td className="py-3 font-black text-orange-300">{player.shirtNumber}</td>
                  <td className="py-3 font-bold">
                    <Link to={`/igraci/${player.id}`} className="hover:text-orange-300">
                      {player.firstName} {player.lastName}{player.nickname ? ` (${player.nickname})` : ''}
                    </Link>
                  </td>
                  <td className="py-3 text-slate-300">{player.team?.shortName || '-'}</td>
                  <td className="py-3 text-slate-300">{player.position}</td>
                  <td className="py-3 text-right font-black">{player.overallRating}</td>
                  <td className="py-3 text-right font-black">{player.goals}</td>
                  <td className="py-3 text-right font-black">{player.assists}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </main>
  );
};
