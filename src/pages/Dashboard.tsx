import { Plus, Swords } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { api, unwrap } from '../api/client';
import { Button, Input, PageTitle, Panel, Select, StatPill } from '../components/ui';
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
            <Select {...register('homeTeamId', { valueAsNumber: true })} defaultValue={teams[0]?.id} disabled={!hasTwoTeams}>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </Select>
            <Select {...register('awayTeamId', { valueAsNumber: true })} defaultValue={awayOptions[0]?.id || teams[1]?.id} disabled={!hasTwoTeams}>
              {awayOptions.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" min={0} placeholder="Home" {...register('homeScore', { required: true, valueAsNumber: true })} disabled={!hasTwoTeams} />
              <Input type="number" min={0} placeholder="Away" {...register('awayScore', { required: true, valueAsNumber: true })} disabled={!hasTwoTeams} />
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
