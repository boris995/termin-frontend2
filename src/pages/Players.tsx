import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import { api, unwrap } from '../api/client';
import { Button, ErrorPanel, Input, PageTitle, Panel, Select } from '../components/ui';
import { Player, Team } from '../types';

export const Players = () => {
  const { id = '1' } = useParams();
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [error, setError] = useState('');
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { firstName: '', lastName: '', nickname: '', position: 'igrac', shirtNumber: 9, teamId: 0 }
  });

  const load = async () => {
    const [playerData, teamData] = await Promise.all([
      api.get(`/seasons/${id}/players`).then(unwrap<Player[]>),
      api.get(`/seasons/${id}/teams`).then(unwrap<Team[]>)
    ]);
    setPlayers(playerData);
    setTeams(teamData);
    setError('');
  };

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || err.message || 'Backend ili baza nisu dostupni.'));
  }, [id]);

  const onSubmit = async (values: any) => {
    const teamId = Number(values.teamId || teams[0]?.id);
    await api.post('/players', { ...values, nickname: values.nickname || null, teamId, seasonId: Number(id), shirtNumber: Number(values.shirtNumber) });
    reset();
    await load();
  };

  const toggleHomeCard = async (player: Player) => {
    await api.put(`/players/${player.id}`, { showOnHome: !player.showOnHome });
    await load();
  };

  return (
    <>
      <PageTitle eyebrow="Roster" title="Igrači i statistika" />
      {error && <ErrorPanel message={error} />}
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Panel className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-widest text-slate-400">
              <tr>
                <th className="pb-3">#</th>
                <th className="pb-3">Igrač</th>
                <th className="pb-3">Tim</th>
                <th className="pb-3">Pozicija</th>
                <th className="pb-3 text-right">Golovi</th>
                <th className="pb-3 text-right">Asistencije</th>
                <th className="pb-3 text-right">Home</th>
                <th className="pb-3 text-right">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {players.map((player) => (
                <tr key={player.id}>
                  <td className="py-3 font-black text-orange-300">{player.shirtNumber}</td>
                  <td className="py-3 font-bold">
                    {player.firstName} {player.lastName}
                    {player.nickname && <span className="ml-2 text-slate-400">({player.nickname})</span>}
                  </td>
                  <td className="py-3 text-slate-300">{player.team?.shortName}</td>
                  <td className="py-3 text-slate-300">{player.position}</td>
                  <td className="py-3 text-right font-black">{player.goals}</td>
                  <td className="py-3 text-right font-black">{player.assists}</td>
                  <td className="py-3 text-right">
                    <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-300">
                      <input type="checkbox" checked={!!player.showOnHome} onChange={() => toggleHomeCard(player)} />
                      Kartica
                    </label>
                  </td>
                  <td className="py-3 text-right">
                    <Link className="rounded bg-white/10 px-3 py-2 text-xs font-bold hover:bg-white/15" to={`/admin/players/${player.id}`}>
                      Uredi
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel>
          <h3 className="mb-4 text-lg font-black">Novi igrač</h3>
          {!teams.length && (
            <p className="mb-4 rounded border border-orange-300/30 bg-orange-500/10 px-3 py-2 text-sm text-orange-100">
              Prvo dodaj ekipe za ovu sezonu, pa onda igrace.
            </p>
          )}
          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <Input placeholder="Ime" {...register('firstName', { required: true })} />
            <Input placeholder="Prezime" {...register('lastName', { required: true })} />
            <Input placeholder="Nadimak opcionalno" {...register('nickname')} />
            <Select {...register('teamId')}>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </Select>
            <Select {...register('position')}>
              {['igrac', 'golman', 'golman-igrac'].map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </Select>
            <Input type="number" min={1} placeholder="Broj dresa" {...register('shirtNumber')} />
            <Button type="submit" className="w-full" disabled={!teams.length}>
              <Plus size={18} />
              Dodaj
            </Button>
          </form>
        </Panel>
      </div>
    </>
  );
};
