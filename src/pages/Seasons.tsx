import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { api, unwrap } from '../api/client';
import { Button, ErrorPanel, Input, PageTitle, Panel, Select } from '../components/ui';
import { Season } from '../types';

interface SeasonForm {
  number?: number | string;
  name?: string;
  winsToWinSeason: number;
}

export const Seasons = () => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const nextNumber = useMemo(() => Math.max(0, ...seasons.map((season) => season.number)) + 1, [seasons]);
  const { register, handleSubmit, reset } = useForm<SeasonForm>({ defaultValues: { number: '', name: '', winsToWinSeason: 8 } });
  const editForm = useForm<Season & { name: string }>({ defaultValues: {} as Season });

  const load = async () => {
    setSeasons(unwrap<Season[]>(await api.get('/seasons')));
    setError('');
  };

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || err.message || 'Backend ili baza nisu dostupni.'));
  }, []);

  const onSubmit = async (values: SeasonForm) => {
    try {
      await api.post('/seasons', {
        number: values.number ? Number(values.number) : undefined,
        name: values.name?.trim() || undefined,
        winsToWinSeason: Number(values.winsToWinSeason || 8)
      });
      reset({ number: '', name: '', winsToWinSeason: 8 });
      setError('');
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Sezona nije kreirana.');
    }
  };

  const startEdit = (season: Season) => {
    setEditingId(season.id);
    editForm.reset(season);
  };

  const saveEdit = async (values: Season) => {
    await api.put(`/seasons/${values.id}`, {
      number: Number(values.number),
      name: values.name?.trim() || undefined,
      winsToWinSeason: Number(values.winsToWinSeason),
      status: values.status
    });
    setEditingId(null);
    await load();
  };

  const deleteSeason = async (season: Season) => {
    if (!window.confirm(`Obrisati sezonu "${season.name}"? Brisu se i njene ekipe, igraci, mecevi i najave.`)) return;
    await api.delete(`/seasons/${season.id}`);
    await load();
  };

  return (
    <>
      <PageTitle eyebrow="Arhiva" title="Sezone" />
      {error && <ErrorPanel message={error} />}
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4 md:grid-cols-2">
          {seasons.map((season) => (
            <Panel key={season.id}>
              {editingId === season.id ? (
                <form className="space-y-3" onSubmit={editForm.handleSubmit(saveEdit)}>
                  <Input type="number" min={1} placeholder="Broj sezone" {...editForm.register('number', { valueAsNumber: true })} />
                  <Input placeholder={`Sezona ${season.number}`} {...editForm.register('name')} />
                  <Input type="number" min={1} placeholder="Cilj pobjeda" {...editForm.register('winsToWinSeason', { valueAsNumber: true })} />
                  <Select {...editForm.register('status')}>
                    <option value="active">active</option>
                    <option value="completed">completed</option>
                  </Select>
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
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-300">Race to {season.winsToWinSeason}</p>
                      <h3 className="mt-2 text-2xl font-black">{season.name}</h3>
                      <p className="mt-2 text-sm text-slate-400">Status: {season.status}</p>
                    </div>
                    <span className="rounded bg-white/10 px-3 py-1 text-xs font-black">#{season.number}</span>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link className="rounded bg-white/10 px-3 py-2 text-sm font-bold hover:bg-white/15" to={`/seasons/${season.id}/teams`}>Ekipe</Link>
                    <Link className="rounded bg-white/10 px-3 py-2 text-sm font-bold hover:bg-white/15" to={`/seasons/${season.id}/players`}>Igraci</Link>
                    <Link className="rounded bg-white/10 px-3 py-2 text-sm font-bold hover:bg-white/15" to={`/seasons/${season.id}/matches`}>Mecevi</Link>
                    <button className="rounded bg-white/10 p-2 hover:bg-white/15" title="Uredi" onClick={() => startEdit(season)}>
                      <Pencil size={16} />
                    </button>
                    <button className="rounded bg-red-500/80 p-2 hover:bg-red-500" title="Obrisi" onClick={() => deleteSeason(season)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </Panel>
          ))}
        </div>
        <Panel>
          <h3 className="mb-4 text-lg font-black">Nova sezona</h3>
          <p className="mb-4 text-sm text-slate-400">Ako ne upises broj ili naziv, sistem ce napraviti #{nextNumber} i naziv "Sezona {nextNumber}".</p>
          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <Input type="number" min={1} placeholder={`Broj (${nextNumber})`} {...register('number')} />
            <Input placeholder={`Naziv opcionalno (Sezona ${nextNumber})`} {...register('name')} />
            <Input type="number" min={1} placeholder="Cilj pobjeda" {...register('winsToWinSeason', { valueAsNumber: true })} />
            {error && <p className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}
            <Button type="submit" className="w-full">
              <Plus size={18} />
              Kreiraj sezonu
            </Button>
          </form>
        </Panel>
      </div>
    </>
  );
};
