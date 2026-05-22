import { BarChart3, Plus, Swords, Target, Trophy, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { api, unwrap } from '../api/client';
import { useCardDesign } from '../components/CardDesignProvider';
import { Button, Field, Input, PageTitle, Panel, Select, StatPill } from '../components/ui';
import { DashboardData, Team } from '../types';

interface MatchForm {
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number;
  awayScore: number;
}

const Progress = ({ team, target }: { team: Team; target: number }) => {
  const wins = team.wins || 0;
  const pct = Math.min(100, (wins / target) * 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm font-bold">
        <span>{team.name}</span>
        <span>{wins}/{target}</span>
      </div>
      <div className="h-4 overflow-hidden rounded bg-slate-800">
        <div className="h-full rounded" style={{ width: `${pct}%`, backgroundColor: team.primaryColor || '#F97316' }} />
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const { siteDesign } = useCardDesign();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');
  const { register, handleSubmit, reset, watch } = useForm<MatchForm>();

  const load = async () => {
    const active = unwrap<any>(await api.get('/seasons/active/current'));
    const seasonId = active?.id || 1;
    setData(unwrap<DashboardData>(await api.get(`/dashboard/season/${seasonId}`)));
  };

  useEffect(() => {
    load().catch(() => setError('Pokreni backend i seed da dashboard dobije podatke.'));
  }, []);

  const teams = data?.teams || [];
  const hasTwoTeams = teams.length >= 2;
  const selectedHome = Number(watch('homeTeamId') || teams[0]?.id);
  const awayOptions = useMemo(() => teams.filter((team) => team.id !== selectedHome), [teams, selectedHome]);

  const onSubmit = async (values: MatchForm) => {
    if (!data || !hasTwoTeams) return;
    try {
      await api.post('/matches', { ...values, seasonId: data.season.id, homeScore: Number(values.homeScore), awayScore: Number(values.awayScore) });
      reset();
      await load();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mec nije sacuvan.');
    }
  };

  if (!data) {
    return (
      <>
        <PageTitle eyebrow="Live panel" title="Duel Liga" />
        <Panel>{error || 'Ucitavanje dashboarda...'}</Panel>
      </>
    );
  }

  const [left, right] = teams;
  const isPremium = siteDesign === 'premium';

  if (isPremium) {
    const topScorer = data.topScorers[0];
    const topAssist = data.topAssists[0];
    const leader = [...teams].sort((a, b) => Number(b.wins || 0) - Number(a.wins || 0))[0];

    return (
      <div className="-mx-4 -my-5 min-h-screen bg-[#05070b] px-4 py-5 text-white lg:-mx-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <section className="relative overflow-hidden rounded-md border border-white/10 bg-[#10131b] p-5 sm:p-7">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:58px_58px]" />
            <div className="absolute right-[-8rem] top-[-8rem] h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-400">Admin dashboard</p>
                <h1 className="mt-2 text-4xl font-black uppercase leading-none tracking-tight sm:text-5xl lg:text-7xl">{data.season.name}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Sezona #{data.season.number} - kontrolni panel za stanje lige, rezultate i brzi unos meca.</p>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:min-w-[30rem]">
                {[
                  { icon: BarChart3, label: 'Odigrano', value: data.totalMatchesPlayed },
                  { icon: Target, label: 'Cilj pobjeda', value: data.season.winsToWinSeason },
                  { icon: Trophy, label: 'Lider', value: leader?.shortName || '-' }
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-md border border-white/10 bg-[#0b0f17] p-3 text-center">
                    <Icon className="mx-auto text-emerald-400" size={18} />
                    <p className="mt-2 text-2xl font-black text-white">{value}</p>
                    <p className="mt-1 text-[0.58rem] font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_380px]">
            <div className="space-y-5">
              <section className="rounded-md border border-white/10 bg-[#10131b] p-5">
                {hasTwoTeams ? (
                  <div className="mb-6 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
                    {[left, right].filter(Boolean).map((team) => (
                      <div key={team.id} className="rounded-md border border-white/10 bg-[#0b0f17] p-5 text-center">
                        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-emerald-400/25 bg-emerald-400/10 text-lg font-black text-emerald-400">
                          {team.shortName?.charAt(0) || team.name.charAt(0)}
                        </div>
                        <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-emerald-400">{team.shortName}</p>
                        <h3 className="mt-1 text-3xl font-black text-white">{team.wins || 0} pobjeda</h3>
                        <p className="mt-1 text-sm text-slate-500">{team.name}</p>
                      </div>
                    ))}
                    <div className="hidden h-14 w-14 place-items-center rounded-full border border-emerald-400/35 bg-emerald-400/10 text-emerald-400 md:grid">
                      <Swords size={26} />
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 rounded-md border border-emerald-400/25 bg-emerald-400/10 p-5">
                    <h3 className="text-xl font-black text-white">Sezona jos nema dvije ekipe.</h3>
                    <p className="mt-2 text-sm text-slate-300">Dodaj dvije ekipe da dashboard moze prikazati duel i omoguciti unos meca.</p>
                    <Link className="mt-4 inline-flex rounded bg-emerald-400 px-4 py-2 text-sm font-black text-slate-950 hover:bg-emerald-300" to={`/seasons/${data.season.id}/teams`}>
                      Dodaj ekipe
                    </Link>
                  </div>
                )}

                <div className="space-y-5">
                  {teams.map((team) => {
                    const wins = team.wins || 0;
                    const pct = Math.min(100, (wins / data.season.winsToWinSeason) * 100);
                    return (
                      <div key={team.id}>
                        <div className="mb-2 flex items-center justify-between text-sm font-black">
                          <span className="text-white">{team.name}</span>
                          <span className="text-emerald-400">{wins}/{data.season.winsToWinSeason}</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded bg-white/10">
                          <div className="h-full rounded bg-emerald-400" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="grid gap-5 md:grid-cols-3">
                {[
                  { title: 'Odigrano', value: data.totalMatchesPlayed, sub: 'ukupno meceva' },
                  { title: 'Top strijelac', value: topScorer ? topScorer.lastName : '-', sub: topScorer ? `${topScorer.goals} golova` : 'nema podataka' },
                  { title: 'Top asistent', value: topAssist ? topAssist.lastName : '-', sub: topAssist ? `${topAssist.assists} asist.` : 'nema podataka' }
                ].map((item) => (
                  <div key={item.title} className="rounded-md border border-white/10 bg-[#10131b] p-5">
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-emerald-400">{item.title}</p>
                    <p className="mt-2 truncate text-3xl font-black text-white">{item.value}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.sub}</p>
                  </div>
                ))}
              </section>
            </div>

            <section className="rounded-md border border-white/10 bg-[#10131b] p-5">
              <div className="mb-4 flex items-center gap-3 text-emerald-400">
                <Plus size={22} />
                <h3 className="text-lg font-black text-white">Brzi unos meca</h3>
              </div>
              <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
                <Field label="Domacin">
                  <Select {...register('homeTeamId', { valueAsNumber: true })} defaultValue={teams[0]?.id} disabled={!hasTwoTeams}>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Gost">
                  <Select {...register('awayTeamId', { valueAsNumber: true })} defaultValue={awayOptions[0]?.id || teams[1]?.id} disabled={!hasTwoTeams}>
                    {awayOptions.map((team) => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </Select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Golovi domacin"><Input type="number" min={0} placeholder="0" {...register('homeScore', { required: true, valueAsNumber: true })} disabled={!hasTwoTeams} /></Field>
                  <Field label="Golovi gost"><Input type="number" min={0} placeholder="0" {...register('awayScore', { required: true, valueAsNumber: true })} disabled={!hasTwoTeams} /></Field>
                </div>
                {error && <p className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}
                <Button type="submit" className="w-full bg-emerald-400 text-slate-950 hover:bg-emerald-300" disabled={!hasTwoTeams}>
                  <Plus size={18} />
                  Sacuvaj rezultat
                </Button>
              </form>
              <div className="mt-5 rounded-md border border-white/10 bg-[#0b0f17] p-4">
                <div className="mb-3 flex items-center gap-2 text-emerald-400">
                  <Users size={18} />
                  <p className="text-sm font-black uppercase tracking-[0.14em]">Top lista</p>
                </div>
                <div className="space-y-2">
                  {data.topScorers.slice(0, 4).map((player, index) => (
                    <Link key={player.id} to={`/admin/players/${player.id}`} className="flex items-center justify-between rounded bg-white/[0.03] px-3 py-2 text-sm hover:bg-white/[0.06]">
                      <span className="truncate text-slate-200">{index + 1}. {player.firstName} {player.lastName}</span>
                      <span className="font-black text-emerald-400">{player.goals}G</span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageTitle eyebrow={`Season ${data.season.number}`} title={`${data.season.name}: The Road To Title`} />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Panel className="p-6">
            {hasTwoTeams ? (
              <div className="mb-8 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
                {[left, right].filter(Boolean).map((team) => (
                  <div key={team.id} className="rounded-lg border border-white/10 bg-slate-950/60 p-5 text-center">
                    <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: team.primaryColor || '#F97316' }}>
                      {team.shortName}
                    </p>
                    <h3 className="mt-2 text-3xl font-black">{team.wins || 0} pobjeda</h3>
                  </div>
                ))}
                <div className="hidden h-14 w-14 place-items-center rounded-full border border-orange-400/40 bg-orange-400/10 text-orange-300 md:grid">
                  <Swords size={26} />
                </div>
              </div>
            ) : (
              <div className="mb-8 rounded border border-orange-300/30 bg-orange-500/10 p-5">
                <h3 className="text-xl font-black text-white">Sezona jos nema dvije ekipe.</h3>
                <p className="mt-2 text-sm text-slate-300">Dodaj dvije ekipe da dashboard moze prikazati duel i omoguciti unos meca.</p>
                <Link className="mt-4 inline-flex rounded bg-orange-500 px-4 py-2 text-sm font-black text-blue-950 hover:bg-orange-400" to={`/seasons/${data.season.id}/teams`}>
                  Dodaj ekipe
                </Link>
              </div>
            )}

            <div className="space-y-5">
              {teams.map((team) => (
                <Progress key={team.id} team={team} target={data.season.winsToWinSeason} />
              ))}
            </div>
          </Panel>

          <div className="grid gap-5 md:grid-cols-3">
            <StatPill label="Odigrano" value={data.totalMatchesPlayed} />
            <StatPill label="Top strijelac" value={data.topScorers[0] ? `${data.topScorers[0].lastName} (${data.topScorers[0].goals})` : '-'} />
            <StatPill label="Top asistent" value={data.topAssists[0] ? `${data.topAssists[0].lastName} (${data.topAssists[0].assists})` : '-'} />
          </div>
        </div>

        <Panel>
          <h3 className="mb-4 text-lg font-black">Brzi unos meca</h3>
          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <Field label="Domacin">
              <Select {...register('homeTeamId', { valueAsNumber: true })} defaultValue={teams[0]?.id} disabled={!hasTwoTeams}>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Gost">
              <Select {...register('awayTeamId', { valueAsNumber: true })} defaultValue={awayOptions[0]?.id || teams[1]?.id} disabled={!hasTwoTeams}>
                {awayOptions.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Golovi domacin"><Input type="number" min={0} placeholder="0" {...register('homeScore', { required: true, valueAsNumber: true })} disabled={!hasTwoTeams} /></Field>
              <Field label="Golovi gost"><Input type="number" min={0} placeholder="0" {...register('awayScore', { required: true, valueAsNumber: true })} disabled={!hasTwoTeams} /></Field>
            </div>
            {error && <p className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}
            <Button type="submit" className="w-full" disabled={!hasTwoTeams}>
              <Plus size={18} />
              Sacuvaj rezultat
            </Button>
          </form>
        </Panel>
      </div>
    </>
  );
};
