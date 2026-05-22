import { Activity, BarChart3, RefreshCcw, Star, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, asArray, getApiErrorMessage, unwrap } from '../api/client';
import { Button, ErrorPanel, Field, PageTitle, Panel, Select } from '../components/ui';
import { Season, VotingAnalyticsData, VotingAnalyticsPlayerTrend } from '../types';
import { formatDateTime } from '../utils/date';

const MetricCard = ({ icon: Icon, label, value }: { icon: typeof BarChart3; label: string; value: string | number }) => (
  <Panel className="p-4">
    <Icon size={20} className="text-orange-300" />
    <p className="mt-3 text-3xl font-black text-white">{value}</p>
    <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
  </Panel>
);

const TrendDots = ({ player }: { player: VotingAnalyticsPlayerTrend }) => {
  const values = player.trend.slice(-8);
  return (
    <div className="flex items-end gap-1">
      {values.map((item) => (
        <Link
          key={`${player.playerId}-${item.matchId}`}
          to={`/rezultati/${item.matchId}`}
          className="grid w-7 place-items-center rounded bg-orange-500 text-[0.62rem] font-black text-blue-950"
          style={{ height: `${Math.max(18, item.average * 5)}px` }}
          title={`Matchday ${item.matchNumber}: ${item.average}`}
        >
          {item.average.toFixed(1)}
        </Link>
      ))}
      {!values.length && <span className="text-sm text-slate-400">Nema trenda</span>}
    </div>
  );
};

export const VotingAnalytics = () => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seasonId, setSeasonId] = useState<number>(1);
  const [data, setData] = useState<VotingAnalyticsData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadSeasons = async () => {
    const items = asArray(await api.get('/seasons').then(unwrap<Season[]>));
    setSeasons(items);
    const active = items.find((season) => season.status === 'active') || items[items.length - 1];
    if (active) setSeasonId((current) => current || active.id);
    return active?.id || items[0]?.id || 1;
  };

  const loadAnalytics = async (nextSeasonId = seasonId) => {
    setLoading(true);
    try {
      const result = await api.get(`/dashboard/season/${nextSeasonId}/voting-analytics`).then(unwrap<VotingAnalyticsData>);
      setData(result);
      setError('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Voting analytics nisu dostupni.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeasons().then((nextSeasonId) => loadAnalytics(nextSeasonId));
  }, []);

  const changeSeason = (nextSeasonId: number) => {
    setSeasonId(nextSeasonId);
    loadAnalytics(nextSeasonId);
  };

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageTitle eyebrow="Voting analytics" title="Ocjene publike" />
        <div className="flex flex-wrap gap-2">
          <Field label="Sezona">
            <Select className="font-bold" value={seasonId} onChange={(event) => changeSeason(Number(event.target.value))}>
              {seasons.map((season) => <option key={season.id} value={season.id}>{season.name}</option>)}
            </Select>
          </Field>
          <Button type="button" onClick={() => loadAnalytics()} disabled={loading}>
            <RefreshCcw size={17} />
            {loading ? 'Ucitavam...' : 'Osvjezi'}
          </Button>
        </div>
      </div>

      {error && <div className="mb-5"><ErrorPanel message={error} /></div>}
      {!data && !error && <Panel>Ucitavanje voting analytics...</Panel>}

      {data && (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard icon={Star} label="Ukupno ocjena" value={data.totalVotes} />
            <MetricCard icon={BarChart3} label="Ocijenjeni mecevi" value={data.ratedMatches} />
            <MetricCard icon={Users} label="Ocijenjeni igraci" value={data.ratedPlayers} />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <Panel>
              <div className="mb-4 flex items-center gap-2 text-orange-300">
                <BarChart3 size={20} />
                <h2 className="font-black text-white">Prosjek po mecu</h2>
              </div>
              <div className="space-y-3">
                {data.matchSummaries.map((match) => (
                  <Link key={match.matchId} to={`/rezultati/${match.matchId}`} className="grid gap-3 rounded border border-white/10 bg-blue-950/60 p-3 hover:border-orange-300/50 md:grid-cols-[120px_1fr_auto] md:items-center">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-300">MD {match.matchNumber}</p>
                      <p className="mt-1 text-xs text-slate-400">{formatDateTime(match.playedAt)}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-black text-white">{match.homeTeam?.shortName} vs {match.awayTeam?.shortName}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {match.topRated ? `Top: ${match.topRated.playerName} (${match.topRated.average})` : 'Nema ocjena za mec'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-orange-300">{match.average?.toFixed(1) || '-'}</p>
                      <p className="text-xs text-slate-400">{match.count} glasova</p>
                    </div>
                  </Link>
                ))}
                {!data.matchSummaries.length && <p className="text-slate-400">Nema odigranih meceva u sezoni.</p>}
              </div>
            </Panel>

            <Panel>
              <div className="mb-4 flex items-center gap-2 text-orange-300">
                <Activity size={20} />
                <h2 className="font-black text-white">Trendovi igraca</h2>
              </div>
              <div className="space-y-3">
                {data.playerTrends.slice(0, 12).map((player) => (
                  <div key={player.playerId} className="rounded border border-white/10 bg-blue-950/60 p-3">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-black text-white">{player.playerName}</p>
                        <p className="text-xs font-bold text-slate-400">{player.teamShortName} | {player.totalVotes} glasova</p>
                      </div>
                      <p className="text-2xl font-black text-orange-300">{player.overallAverage?.toFixed(1) || '-'}</p>
                    </div>
                    <TrendDots player={player} />
                  </div>
                ))}
                {!data.playerTrends.length && <p className="text-slate-400">Jos nema public ocjena za igrace.</p>}
              </div>
            </Panel>
          </div>
        </div>
      )}
    </>
  );
};
