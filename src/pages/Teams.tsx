import { Pencil, Plus, Save, Trash2, UserPlus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import { api, unwrap } from '../api/client';
import { Button, ErrorPanel, Input, PageTitle, Panel } from '../components/ui';
import { Player, Team } from '../types';

interface TeamForm {
  name: string;
  shortName: string;
  logoUrl?: string;
  representativeName?: string;
  primaryColor?: string;
}

export const Teams = () => {
  const { id = '1' } = useParams();
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const { register, handleSubmit, reset } = useForm<TeamForm>({ defaultValues: { name: '', shortName: '', logoUrl: '', representativeName: '', primaryColor: '#F97316' } });
  const editForm = useForm<TeamForm & { id: number }>({ defaultValues: {} as TeamForm & { id: number } });

  const load = async () => {
    const [teamData, playerData] = await Promise.all([
      api.get(`/seasons/${id}/teams`).then(unwrap<Team[]>),
      api.get(`/seasons/${id}/players`).then(unwrap<Player[]>)
    ]);
    setTeams(teamData);
    setPlayers(playerData);
    setError('');
  };

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || err.message || 'Backend ili baza nisu dostupni.'));
  }, [id]);

  const onSubmit = async (values: TeamForm) => {
    try {
      await api.post(`/seasons/${id}/teams`, {
        ...values,
        logoUrl: values.logoUrl?.trim() || null,
        representativeName: values.representativeName?.trim() || null
      });
      reset({ name: '', shortName: '', logoUrl: '', representativeName: '', primaryColor: '#F97316' });
      setError('');
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ekipa nije kreirana.');
    }
  };

  const startEdit = (team: Team) => {
    setEditingId(team.id);
    editForm.reset({
      id: team.id,
      name: team.name,
      shortName: team.shortName,
      logoUrl: team.logoUrl || '',
      representativeName: team.representativeName || '',
      primaryColor: team.primaryColor || '#F97316'
    });
  };

  const saveEdit = async (values: TeamForm & { id: number }) => {
    await api.put(`/teams/${values.id}`, {
      name: values.name,
      shortName: values.shortName,
      logoUrl: values.logoUrl?.trim() || null,
      representativeName: values.representativeName?.trim() || null,
      primaryColor: values.primaryColor
    });
    setEditingId(null);
    await load();
  };

  const deleteTeam = async (team: Team) => {
    if (!window.confirm(`Obrisati ekipu "${team.name}"? Brisu se i njeni igraci.`)) return;
    await api.delete(`/teams/${team.id}`);
    await load();
  };

  const countPlayers = (teamId: number) => players.filter((player) => player.teamId === teamId).length;

  return (
    <>
      <PageTitle eyebrow="Duel liga" title="Upravljanje ekipama" />
      {error && <ErrorPanel message={error} />}
      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-4 md:grid-cols-2">
          {teams.map((team) => {
            const playerCount = countPlayers(team.id);
            return (
              <Panel key={team.id}>
                {editingId === team.id ? (
                  <form className="space-y-3" onSubmit={editForm.handleSubmit(saveEdit)}>
                    <Input placeholder="Naziv ekipe" {...editForm.register('name', { required: true })} />
                    <Input maxLength={4} placeholder="Kratki naziv" {...editForm.register('shortName', { required: true })} />
                    <Input placeholder="Logo URL opcionalno" {...editForm.register('logoUrl')} />
                    <Input placeholder="Predstavnik opcionalno" {...editForm.register('representativeName')} />
                    <Input type="color" {...editForm.register('primaryColor')} />
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        <Save size={17} />
                        Sacuvaj
                      </Button>
                      <button type="button" className="rounded border border-white/10 px-3 py-2 text-sm font-bold hover:bg-white/10" onClick={() => setEditingId(null)}>
                        <X size={17} />
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="mb-4 h-2 rounded" style={{ backgroundColor: team.primaryColor || '#F97316' }} />
                    <div className="flex items-start gap-4">
                      {team.logoUrl ? (
                        <img className="h-14 w-14 rounded border border-white/10 object-cover" src={team.logoUrl} alt={team.name} />
                      ) : (
                        <div className="grid h-14 w-14 place-items-center rounded border border-white/10 bg-white/10 text-lg font-black">{team.shortName}</div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-400">{team.shortName}</p>
                        <h3 className="mt-1 text-3xl font-black">{team.name}</h3>
                        {team.representativeName && <p className="mt-2 text-sm text-slate-300">Predstavnik: {team.representativeName}</p>}
                      </div>
                    </div>
                    <div className="mt-4 rounded border border-white/10 bg-slate-950/50 p-3 text-sm">
                      <p className={playerCount ? 'text-slate-300' : 'text-orange-200'}>
                        Igraci: <span className="font-black text-white">{playerCount}</span>
                        {!playerCount && ' - dodaj bar jednog igraca prije meceva.'}
                      </p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link className="inline-flex items-center gap-2 rounded bg-white/10 px-3 py-2 text-sm font-bold hover:bg-white/15" to={`/seasons/${id}/players`}>
                        <UserPlus size={16} />
                        Igraci
                      </Link>
                      <button className="rounded bg-white/10 p-2 hover:bg-white/15" title="Uredi" onClick={() => startEdit(team)}>
                        <Pencil size={16} />
                      </button>
                      <button className="rounded bg-red-500/80 p-2 hover:bg-red-500" title="Obrisi" onClick={() => deleteTeam(team)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </Panel>
            );
          })}
        </div>
        <Panel>
          <h3 className="mb-4 text-lg font-black">Dodaj ekipu</h3>
          <p className="mb-4 text-sm text-slate-400">Svaka sezona moze imati najvise dvije ekipe. Ekipe pripadaju samo ovoj sezoni.</p>
          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <Input placeholder="Naziv ekipe" {...register('name', { required: true })} />
            <Input maxLength={4} placeholder="Kratki naziv" {...register('shortName', { required: true })} />
            <Input placeholder="Logo URL opcionalno" {...register('logoUrl')} />
            <Input placeholder="Predstavnik opcionalno" {...register('representativeName')} />
            <Input type="color" {...register('primaryColor')} />
            {error && <p className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}
            <Button disabled={teams.length >= 2} type="submit" className="w-full">
              <Plus size={18} />
              Dodaj ekipu
            </Button>
          </form>
        </Panel>
      </div>
    </>
  );
};
