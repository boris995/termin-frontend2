import { CalendarPlus, FilePlus, Pencil, Play, Square, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { api, unwrap } from '../api/client';
import { Button, Input, PageTitle, Panel, Select } from '../components/ui';
import { CmsBlock, NextMatch, Player, Team } from '../types';
import { formatDateTime } from '../utils/date';

interface BlockForm {
  title: string;
  body: string;
  type: 'text' | 'news' | 'announcement';
  imageUrl?: string;
  sortOrder: number;
}

interface NextMatchForm {
  seasonId: number;
  homeTeamId: number;
  awayTeamId: number;
  scheduledAt: string;
  venue?: string;
  note?: string;
}

export const Cms = () => {
  const [blocks, setBlocks] = useState<CmsBlock[]>([]);
  const [nextMatches, setNextMatches] = useState<NextMatch[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [editingBlock, setEditingBlock] = useState<CmsBlock | null>(null);
  const [error, setError] = useState('');
  const [finishForms, setFinishForms] = useState<Record<number, { homeScore: number; awayScore: number; votingEnabled: boolean; participants: number[]; stats: Record<number, { goals: number; assists: number }> }>>({});
  const blockForm = useForm<BlockForm>({ defaultValues: { title: '', body: '', type: 'news', imageUrl: '', sortOrder: 0 } });
  const nextForm = useForm<NextMatchForm>({ defaultValues: { seasonId: 1, homeTeamId: 0, awayTeamId: 0, scheduledAt: '', venue: '', note: '' } });

  const load = async () => {
    const [cmsBlocks, scheduled, seasonTeams, seasonPlayers] = await Promise.all([
      api.get('/cms/blocks').then(unwrap<CmsBlock[]>),
      api.get('/cms/next-matches').then(unwrap<NextMatch[]>),
      api.get('/seasons/1/teams').then(unwrap<Team[]>),
      api.get('/seasons/1/players').then(unwrap<Player[]>)
    ]);
    setBlocks(cmsBlocks);
    setNextMatches(scheduled);
    setTeams(seasonTeams);
    setPlayers(seasonPlayers);
  };

  useEffect(() => {
    load().catch(() => setError('CMS podaci nisu dostupni. Provjeri backend i seed.'));
  }, []);

  const submitBlock = async (values: BlockForm) => {
    const payload = { ...values, sortOrder: Number(values.sortOrder), isPublished: true };
    if (editingBlock) {
      await api.put(`/cms/blocks/${editingBlock.id}`, payload);
      setEditingBlock(null);
    } else {
      await api.post('/cms/blocks', payload);
    }
    blockForm.reset({ title: '', body: '', type: 'news', imageUrl: '', sortOrder: 0 });
    await load();
  };

  const startEditBlock = (block: CmsBlock) => {
    setEditingBlock(block);
    blockForm.reset({
      title: block.title,
      body: block.body,
      type: block.type,
      imageUrl: block.imageUrl || '',
      sortOrder: block.sortOrder
    });
  };

  const deleteBlock = async (block: CmsBlock) => {
    const confirmed = window.confirm(`Obrisati CMS blok "${block.title}"?`);
    if (!confirmed) return;
    await api.delete(`/cms/blocks/${block.id}`);
    await load();
  };

  const createNextMatch = async (values: NextMatchForm) => {
    const homeTeamId = Number(values.homeTeamId || teams[0]?.id);
    const awayTeamId = Number(values.awayTeamId || teams.find((team) => team.id !== homeTeamId)?.id);
    await api.post('/cms/next-matches', {
      ...values,
      seasonId: Number(values.seasonId || 1),
      homeTeamId,
      awayTeamId,
      scheduledAt: new Date(values.scheduledAt).toISOString()
    });
    nextForm.reset();
    await load();
  };

  const cancelNextMatch = async (match: NextMatch) => {
    await api.put(`/cms/next-matches/${match.id}`, { status: 'cancelled' });
    await load();
  };

  const startNextMatch = async (match: NextMatch) => {
    await api.post(`/cms/next-matches/${match.id}/start`);
    await load();
  };

  const updateFinishForm = (matchId: number, patch: Partial<{ homeScore: number; awayScore: number; votingEnabled: boolean; participants: number[]; stats: Record<number, { goals: number; assists: number }> }>) => {
    setFinishForms((current) => ({
      ...current,
      [matchId]: {
        homeScore: current[matchId]?.homeScore || 0,
        awayScore: current[matchId]?.awayScore || 0,
        votingEnabled: current[matchId]?.votingEnabled ?? true,
        participants: current[matchId]?.participants || [],
        stats: current[matchId]?.stats || {},
        ...patch
      }
    }));
  };

  const toggleParticipant = (match: NextMatch, player: Player) => {
    const form = finishForms[match.id] || { homeScore: 0, awayScore: 0, votingEnabled: true, participants: [], stats: {} };
    const exists = form.participants.includes(player.id);
    updateFinishForm(match.id, {
      participants: exists ? form.participants.filter((id) => id !== player.id) : [...form.participants, player.id],
      stats: { ...form.stats, [player.id]: form.stats[player.id] || { goals: 0, assists: 0 } }
    });
  };

  const finishNextMatch = async (match: NextMatch) => {
    const form = finishForms[match.id] || { homeScore: 0, awayScore: 0, votingEnabled: true, participants: [], stats: {} };
    const playerStats = form.participants.map((playerId) => {
      const player = players.find((item) => item.id === playerId);
      return {
        playerId,
        teamId: player?.teamId,
        goals: Number(form.stats[playerId]?.goals || 0),
        assists: Number(form.stats[playerId]?.assists || 0)
      };
    });
    await api.post(`/cms/next-matches/${match.id}/finish`, {
      homeScore: Number(form.homeScore || 0),
      awayScore: Number(form.awayScore || 0),
      votingEnabled: form.votingEnabled,
      playerStats
    });
    await load();
  };

  return (
    <>
      <PageTitle eyebrow="Content management" title="CMS sadrzaj za home page" />
      {error && <Panel className="mb-5 text-red-200">{error}</Panel>}
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel>
          <h3 className="mb-4 text-lg font-black">{editingBlock ? 'Uredi sadrzaj' : 'Dodaj sadrzaj'}</h3>
          <form className="space-y-3" onSubmit={blockForm.handleSubmit(submitBlock)}>
            <Input placeholder="Naslov" {...blockForm.register('title', { required: true })} />
            <Select {...blockForm.register('type')}>
              <option value="news">Novost</option>
              <option value="announcement">Obavjestenje</option>
              <option value="text">Tekst</option>
            </Select>
            <Input placeholder="URL slike opcionalno" {...blockForm.register('imageUrl')} />
            <Input type="number" placeholder="Redoslijed" {...blockForm.register('sortOrder', { valueAsNumber: true })} />
            <textarea
              className="min-h-36 w-full rounded border border-white/10 bg-blue-950/80 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400"
              placeholder="Sadrzaj"
              {...blockForm.register('body', { required: true })}
            />
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                <FilePlus size={18} />
                {editingBlock ? 'Sacuvaj izmjene' : 'Objavi blok'}
              </Button>
              {editingBlock && (
                <button
                  type="button"
                  className="rounded border border-white/10 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/10"
                  onClick={() => {
                    setEditingBlock(null);
                    blockForm.reset({ title: '', body: '', type: 'news', imageUrl: '', sortOrder: 0 });
                  }}
                >
                  Otkaži
                </button>
              )}
            </div>
          </form>
        </Panel>

        <Panel>
          <h3 className="mb-4 text-lg font-black">Najavi sljedecu utakmicu</h3>
          <form className="space-y-3" onSubmit={nextForm.handleSubmit(createNextMatch)}>
            <Input type="number" min={1} placeholder="Season ID" {...nextForm.register('seasonId', { valueAsNumber: true })} />
            <Select {...nextForm.register('homeTeamId', { valueAsNumber: true })}>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </Select>
            <Select {...nextForm.register('awayTeamId', { valueAsNumber: true })}>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </Select>
            <Input type="datetime-local" {...nextForm.register('scheduledAt', { required: true })} />
            <Input placeholder="Lokacija" {...nextForm.register('venue')} />
            <textarea
              className="min-h-24 w-full rounded border border-white/10 bg-blue-950/80 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400"
              placeholder="Napomena"
              {...nextForm.register('note')}
            />
            <Button type="submit" className="w-full">
              <CalendarPlus size={18} />
              Sacuvaj najavu
            </Button>
          </form>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Panel>
          <h3 className="mb-4 text-lg font-black">Objavljeni blokovi</h3>
          <div className="space-y-3">
            {blocks.map((block) => (
              <div key={block.id} className="rounded border border-white/10 bg-blue-950/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-300">{block.type}</p>
                    <h4 className="mt-1 font-black">{block.title}</h4>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded bg-white/10 p-2 hover:bg-white/15" onClick={() => startEditBlock(block)} title="Uredi">
                      <Pencil size={16} />
                    </button>
                    <button className="rounded bg-red-500/80 p-2 hover:bg-red-500" onClick={() => deleteBlock(block)} title="Obrisi">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-400">{block.body}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <h3 className="mb-4 text-lg font-black">Najave utakmica</h3>
          <div className="space-y-3">
            {nextMatches.map((match) => (
              <div key={match.id} className="rounded border border-white/10 bg-blue-950/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-black">{match.homeTeam?.shortName} vs {match.awayTeam?.shortName}</h4>
                    <p className="mt-2 text-sm text-slate-400">{formatDateTime(match.scheduledAt)}</p>
                    {match.venue && <p className="text-sm text-slate-400">{match.venue}</p>}
                    <p className="mt-1 text-xs uppercase tracking-widest text-orange-300">{match.status}</p>
                  </div>
                  {match.status !== 'cancelled' && (
                    <div className="flex flex-wrap justify-end gap-2">
                      {match.status === 'scheduled' && (
                        <button className="inline-flex items-center gap-2 rounded bg-orange-500 px-3 py-2 text-xs font-black text-blue-950 hover:bg-orange-400" onClick={() => startNextMatch(match)}>
                          <Play size={14} />
                          Pokreni sada
                        </button>
                      )}
                      <button className="rounded bg-white/10 px-3 py-2 text-xs font-bold hover:bg-white/15" onClick={() => cancelNextMatch(match)}>
                        Otkazi
                      </button>
                    </div>
                  )}
                </div>
                {match.status === 'live' && (
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <div className="mb-3 flex items-center gap-2 text-orange-300">
                      <Square size={16} />
                      <h5 className="font-black">Zavrsi mec i objavi rezultat</h5>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input
                        type="number"
                        min={0}
                        placeholder={`${match.homeTeam?.shortName} golovi`}
                        value={finishForms[match.id]?.homeScore ?? 0}
                        onChange={(event) => updateFinishForm(match.id, { homeScore: Number(event.target.value) })}
                      />
                      <Input
                        type="number"
                        min={0}
                        placeholder={`${match.awayTeam?.shortName} golovi`}
                        value={finishForms[match.id]?.awayScore ?? 0}
                        onChange={(event) => updateFinishForm(match.id, { awayScore: Number(event.target.value) })}
                      />
                    </div>
                    <label className="mt-3 flex items-center gap-2 rounded border border-white/10 bg-slate-950/40 px-3 py-2 text-sm font-bold text-slate-200">
                      <input
                        type="checkbox"
                        checked={finishForms[match.id]?.votingEnabled ?? true}
                        onChange={(event) => updateFinishForm(match.id, { votingEnabled: event.target.checked })}
                      />
                      Dozvoli glasanje publike
                    </label>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      {[match.homeTeam, match.awayTeam].map((team) => (
                        <div key={team.id} className="rounded border border-white/10 bg-slate-950/40 p-3">
                          <h6 className="mb-3 text-sm font-black text-white">{team.name}</h6>
                          <div className="space-y-3">
                            {players.filter((player) => player.teamId === team.id).map((player) => {
                              const selected = finishForms[match.id]?.participants.includes(player.id) || false;
                              return (
                                <div key={player.id} className="rounded bg-white/5 p-3">
                                  <label className="flex items-center gap-2 text-sm font-bold">
                                    <input type="checkbox" checked={selected} onChange={() => toggleParticipant(match, player)} />
                                    {player.firstName} {player.lastName}
                                  </label>
                                  {selected && (
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                      <Input
                                        type="number"
                                        min={0}
                                        placeholder="Golovi"
                                        value={finishForms[match.id]?.stats[player.id]?.goals ?? 0}
                                        onChange={(event) =>
                                          updateFinishForm(match.id, {
                                            stats: {
                                              ...(finishForms[match.id]?.stats || {}),
                                              [player.id]: { ...(finishForms[match.id]?.stats[player.id] || { assists: 0 }), goals: Number(event.target.value) }
                                            }
                                          })
                                        }
                                      />
                                      <Input
                                        type="number"
                                        min={0}
                                        placeholder="Asistencije"
                                        value={finishForms[match.id]?.stats[player.id]?.assists ?? 0}
                                        onChange={(event) =>
                                          updateFinishForm(match.id, {
                                            stats: {
                                              ...(finishForms[match.id]?.stats || {}),
                                              [player.id]: { ...(finishForms[match.id]?.stats[player.id] || { goals: 0 }), assists: Number(event.target.value) }
                                            }
                                          })
                                        }
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button type="button" className="mt-4 w-full" onClick={() => finishNextMatch(match)} disabled={!finishForms[match.id]?.participants.length}>
                      Objavi zavrseni mec
                    </Button>
                  </div>
                )}
                {match.status === 'completed' && match.matchId && (
                  <p className="mt-3 text-sm text-slate-300">Objavljeno kao Matchday {match.match?.matchNumber || match.matchId}.</p>
                )}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
};
