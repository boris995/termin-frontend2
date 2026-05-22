import { CalendarClock, ChevronDown, ChevronUp, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, asArray, getApiErrorMessage, unwrap } from '../api/client';
import { Button, ErrorPanel, Field, Input, PageTitle, Panel, Select, Textarea } from '../components/ui';
import { Match, MatchTimelineEvent, Player, Team } from '../types';
import { formatDateTime } from '../utils/date';

type EditForm = {
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number;
  awayScore: number;
  playedAt: string;
  startedAt: string;
  endedAt: string;
  votingEnabled: boolean;
  reportSummary: string;
  participants: number[];
  stats: Record<number, { goals: number; assists: number }>;
  timelineEvents: MatchTimelineEvent[];
};

const toLocalInput = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const toIsoOrUndefined = (value: string) => value ? new Date(value).toISOString() : undefined;

const emptyEvent = (teamId?: number): MatchTimelineEvent => ({
  minute: '',
  type: 'goal',
  teamId: teamId || null,
  playerId: null,
  assistPlayerId: null,
  description: ''
});

export const Matches = () => {
  const { id = '1' } = useParams();
  const seasonId = Number(id);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [forms, setForms] = useState<Record<number, EditForm>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [matchItems, teamItems, playerItems] = await Promise.all([
        api.get(`/seasons/${id}/matches`).then(unwrap<Match[]>),
        api.get(`/seasons/${id}/teams`).then(unwrap<Team[]>),
        api.get(`/seasons/${id}/players`).then(unwrap<Player[]>)
      ]);
      setMatches(asArray(matchItems));
      setTeams(asArray(teamItems));
      setPlayers(asArray(playerItems));
      setError('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Backend ili baza nisu dostupni.'));
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const playersByTeam = useMemo(() => {
    return asArray(players).reduce<Record<number, Player[]>>((acc, player) => {
      acc[player.teamId] = [...(acc[player.teamId] || []), player];
      return acc;
    }, {});
  }, [players]);

  const buildForm = (match: Match): EditForm => {
    const stats = asArray(match.playerStats).reduce<Record<number, { goals: number; assists: number }>>((acc, stat) => {
      acc[stat.player.id] = { goals: Number(stat.goals || 0), assists: Number(stat.assists || 0) };
      return acc;
    }, {});
    return {
      homeTeamId: match.homeTeam.id,
      awayTeamId: match.awayTeam.id,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      playedAt: toLocalInput(match.playedAt),
      startedAt: toLocalInput(match.startedAt),
      endedAt: toLocalInput(match.endedAt),
      votingEnabled: match.votingEnabled ?? true,
      reportSummary: match.reportSummary || '',
      participants: asArray(match.playerStats).map((stat) => stat.player.id),
      stats,
      timelineEvents: asArray(match.timelineEvents).length ? asArray(match.timelineEvents) : []
    };
  };

  const openEditor = (match: Match) => {
    setForms((current) => ({ ...current, [match.id]: current[match.id] || buildForm(match) }));
    setEditingId((current) => current === match.id ? null : match.id);
  };

  const updateForm = (matchId: number, patch: Partial<EditForm>) => {
    setForms((current) => ({ ...current, [matchId]: { ...current[matchId], ...patch } }));
  };

  const toggleParticipant = (matchId: number, player: Player) => {
    const form = forms[matchId];
    const selected = form.participants.includes(player.id);
    updateForm(matchId, {
      participants: selected ? form.participants.filter((playerId) => playerId !== player.id) : [...form.participants, player.id],
      stats: { ...form.stats, [player.id]: form.stats[player.id] || { goals: 0, assists: 0 } }
    });
  };

  const saveMatch = async (match: Match) => {
    const form = forms[match.id];
    if (!form) return;
    if (form.homeTeamId === form.awayTeamId) {
      setError('Domaca i gostujuca ekipa moraju biti razlicite.');
      return;
    }

    try {
      setSavingId(match.id);
      const playerStats = form.participants.map((playerId) => {
        const player = players.find((item) => item.id === playerId);
        return {
          playerId,
          teamId: player?.teamId,
          goals: Number(form.stats[playerId]?.goals || 0),
          assists: Number(form.stats[playerId]?.assists || 0)
        };
      }).filter((stat) => stat.teamId);

      await api.put(`/matches/${match.id}`, {
        seasonId,
        homeTeamId: Number(form.homeTeamId),
        awayTeamId: Number(form.awayTeamId),
        homeScore: Number(form.homeScore || 0),
        awayScore: Number(form.awayScore || 0),
        playedAt: toIsoOrUndefined(form.playedAt),
        startedAt: toIsoOrUndefined(form.startedAt),
        endedAt: toIsoOrUndefined(form.endedAt),
        votingEnabled: form.votingEnabled,
        reportSummary: form.reportSummary,
        timelineEvents: form.timelineEvents
          .filter((event) => String(event.minute || '').trim())
          .map((event) => ({
            ...event,
            teamId: event.teamId ? Number(event.teamId) : null,
            playerId: event.playerId ? Number(event.playerId) : null,
            assistPlayerId: event.assistPlayerId ? Number(event.assistPlayerId) : null
          })),
        playerStats
      });
      await load();
      setEditingId(null);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Utakmica nije sacuvana.'));
    } finally {
      setSavingId(null);
    }
  };

  const updateTimelineEvent = (matchId: number, index: number, patch: Partial<MatchTimelineEvent>) => {
    const form = forms[matchId];
    updateForm(matchId, {
      timelineEvents: form.timelineEvents.map((event, itemIndex) => itemIndex === index ? { ...event, ...patch } : event)
    });
  };

  const removeTimelineEvent = (matchId: number, index: number) => {
    const form = forms[matchId];
    updateForm(matchId, { timelineEvents: form.timelineEvents.filter((_, itemIndex) => itemIndex !== index) });
  };

  return (
    <>
      <PageTitle eyebrow="Match log" title="Odigrani mecevi" />
      {error && <div className="mb-5"><ErrorPanel message={error} /></div>}
      <div className="space-y-4">
        {matches.map((match) => {
          const form = forms[match.id];
          const isEditing = editingId === match.id && form;
          return (
            <Panel key={match.id}>
              <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
                <div>
                  <p className="inline-flex rounded bg-orange-500 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-blue-950">
                    Matchday {match.matchNumber}
                  </p>
                  <h3 className="mt-1 text-xl font-black">{match.homeTeam.name}</h3>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-slate-400">
                    <CalendarClock size={13} />
                    {formatDateTime(match.playedAt)}
                  </p>
                </div>
                <div className="rounded border border-white/10 bg-slate-950 px-6 py-3 text-center text-3xl font-black">
                  {match.homeScore} : {match.awayScore}
                </div>
                <div className="md:text-right">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-300">
                    {match.winnerTeam ? `Pobjednik: ${match.winnerTeam.shortName}` : 'Nerijeseno'}
                  </p>
                  <h3 className="mt-1 text-xl font-black">{match.awayTeam.name}</h3>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
                <Button type="button" onClick={() => openEditor(match)}>
                  {isEditing ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                  {isEditing ? 'Zatvori editor' : 'Uredi sve parametre'}
                </Button>
                <Link className="rounded border border-white/10 px-4 py-2 text-sm font-black text-slate-200 hover:bg-white/10" to={`/rezultati/${match.id}`}>
                  Otvori izvjestaj
                </Link>
              </div>

              {isEditing && (
                <div className="mt-5 space-y-5 border-t border-white/10 pt-5">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Domacin">
                      <Select value={form.homeTeamId} onChange={(event) => updateForm(match.id, { homeTeamId: Number(event.target.value) })}>
                        {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                      </Select>
                    </Field>
                    <Field label="Gost">
                      <Select value={form.awayTeamId} onChange={(event) => updateForm(match.id, { awayTeamId: Number(event.target.value) })}>
                        {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                      </Select>
                    </Field>
                    <Field label="Golovi domacin"><Input type="number" min={0} value={form.homeScore} onChange={(event) => updateForm(match.id, { homeScore: Number(event.target.value) })} placeholder="0" /></Field>
                    <Field label="Golovi gost"><Input type="number" min={0} value={form.awayScore} onChange={(event) => updateForm(match.id, { awayScore: Number(event.target.value) })} placeholder="0" /></Field>
                    <Field label="Pocetak meca"><Input type="datetime-local" value={form.startedAt} onChange={(event) => updateForm(match.id, { startedAt: event.target.value })} /></Field>
                    <Field label="Kraj meca"><Input type="datetime-local" value={form.endedAt || form.playedAt} onChange={(event) => updateForm(match.id, { endedAt: event.target.value, playedAt: event.target.value })} /></Field>
                  </div>

                  <label className="flex items-center gap-2 rounded border border-white/10 bg-slate-950/40 px-3 py-2 text-sm font-bold text-slate-200">
                    <input type="checkbox" checked={form.votingEnabled} onChange={(event) => updateForm(match.id, { votingEnabled: event.target.checked })} />
                    Dozvoli glasanje publike
                  </label>

                  <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-orange-300">Sazetak izvjestaja</p>
                    <Field label="Sazetak izvjestaja">
                      <Textarea
                        className="min-h-28"
                        value={form.reportSummary}
                        onChange={(event) => updateForm(match.id, { reportSummary: event.target.value })}
                        placeholder="Kratak opis utakmice koji se prikazuje u izvjestaju."
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    {teams.map((team) => (
                      <div key={team.id} className="rounded border border-white/10 bg-slate-950/40 p-3">
                        <h4 className="mb-3 text-sm font-black text-white">{team.name}</h4>
                        <div className="space-y-3">
                          {asArray(playersByTeam[team.id]).map((player) => {
                            const selected = form.participants.includes(player.id);
                            return (
                              <div key={player.id} className="rounded bg-white/5 p-3">
                                <label className="flex items-center gap-2 text-sm font-bold">
                                  <input type="checkbox" checked={selected} onChange={() => toggleParticipant(match.id, player)} />
                                  {player.firstName} {player.lastName}
                                </label>
                                {selected && (
                                  <div className="mt-2 grid grid-cols-2 gap-2">
                                    <Input
                                      type="number"
                                      min={0}
                                      value={form.stats[player.id]?.goals ?? 0}
                                      onChange={(event) => updateForm(match.id, { stats: { ...form.stats, [player.id]: { ...(form.stats[player.id] || { assists: 0 }), goals: Number(event.target.value) } } })}
                                      placeholder="Golovi"
                                    />
                                    <Input
                                      type="number"
                                      min={0}
                                      value={form.stats[player.id]?.assists ?? 0}
                                      onChange={(event) => updateForm(match.id, { stats: { ...form.stats, [player.id]: { ...(form.stats[player.id] || { goals: 0 }), assists: Number(event.target.value) } } })}
                                      placeholder="Asistencije"
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

                  <div className="rounded border border-white/10 bg-slate-950/40 p-3">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Timeline</p>
                        <h4 className="mt-1 font-black text-white">Dogadjaji po minutama</h4>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded bg-white/10 px-3 py-2 text-xs font-black hover:bg-white/15"
                        onClick={() => updateForm(match.id, { timelineEvents: [...form.timelineEvents, emptyEvent(form.homeTeamId)] })}
                      >
                        <Plus size={14} />
                        Dodaj dogadjaj
                      </button>
                    </div>
                    <div className="space-y-3">
                      {form.timelineEvents.map((event, index) => (
                        <div key={`${match.id}-event-${index}`} className="grid gap-2 rounded border border-white/10 bg-blue-950/50 p-3 lg:grid-cols-[80px_150px_1fr_1fr_1fr_auto]">
                          <Field label="Minut"><Input value={event.minute} onChange={(item) => updateTimelineEvent(match.id, index, { minute: item.target.value })} placeholder="23'" /></Field>
                          <Field label="Tip">
                            <Select value={event.type} onChange={(item) => updateTimelineEvent(match.id, index, { type: item.target.value as MatchTimelineEvent['type'] })}>
                              <option value="goal">Gol</option>
                              <option value="yellow-card">Zuti karton</option>
                              <option value="red-card">Crveni karton</option>
                              <option value="note">Biljeska</option>
                            </Select>
                          </Field>
                          <Field label="Ekipa">
                            <Select value={event.teamId || ''} onChange={(item) => updateTimelineEvent(match.id, index, { teamId: item.target.value ? Number(item.target.value) : null })}>
                              <option value="">Ekipa</option>
                              {teams.map((team) => <option key={team.id} value={team.id}>{team.shortName}</option>)}
                            </Select>
                          </Field>
                          <Field label="Igrac">
                            <Select value={event.playerId || ''} onChange={(item) => updateTimelineEvent(match.id, index, { playerId: item.target.value ? Number(item.target.value) : null })}>
                              <option value="">Igrac</option>
                              {players.map((player) => <option key={player.id} value={player.id}>{player.firstName} {player.lastName}</option>)}
                            </Select>
                          </Field>
                          <Field label="Opis"><Input value={event.description || ''} onChange={(item) => updateTimelineEvent(match.id, index, { description: item.target.value })} placeholder="Opis" /></Field>
                          <button type="button" className="rounded bg-red-500/80 p-2 hover:bg-red-500" onClick={() => removeTimelineEvent(match.id, index)} title="Obrisi dogadjaj">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      {!form.timelineEvents.length && <p className="text-sm text-slate-400">Jos nema timeline dogadjaja.</p>}
                    </div>
                  </div>

                  <Button type="button" className="w-full md:w-auto" onClick={() => saveMatch(match)} disabled={savingId === match.id}>
                    <Save size={18} />
                    {savingId === match.id ? 'Cuvam...' : 'Sacuvaj utakmicu'}
                  </Button>
                </div>
              )}
            </Panel>
          );
        })}
        {!matches.length && !error && <Panel>Nema utakmica za ovu sezonu.</Panel>}
      </div>
    </>
  );
};
