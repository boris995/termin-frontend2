import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, asArray, unwrap } from '../api/client';
import { ErrorPanel, PageTitle, Panel } from '../components/ui';
import { Match } from '../types';

export const Matches = () => {
  const { id = '1' } = useParams();
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/seasons/${id}/matches`).then(unwrap<Match[]>).then((items) => {
      setMatches(asArray(items));
      setError('');
    }).catch((err) => setError(err.response?.data?.message || err.message || 'Backend ili baza nisu dostupni.'));
  }, [id]);

  const load = () => api.get(`/seasons/${id}/matches`).then(unwrap<Match[]>).then((items) => {
    setMatches(asArray(items));
    setError('');
  }).catch((err) => setError(err.response?.data?.message || err.message || 'Backend ili baza nisu dostupni.'));

  const toggleVoting = async (match: Match) => {
    await api.put(`/matches/${match.id}`, {
      seasonId: match.homeTeam.seasonId,
      homeTeamId: match.homeTeam.id,
      awayTeamId: match.awayTeam.id,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      playedAt: match.playedAt,
      startedAt: match.startedAt,
      endedAt: match.endedAt,
      votingEnabled: !match.votingEnabled,
      playerStats: match.playerStats?.map((stat) => ({ playerId: stat.player.id, teamId: stat.team.id, goals: stat.goals, assists: stat.assists })) || []
    });
    await load();
  };

  return (
    <>
      <PageTitle eyebrow="Match log" title="Odigrani mečevi" />
      {error && <ErrorPanel message={error} />}
      <div className="space-y-4">
        {matches.map((match) => (
          <Panel key={match.id}>
            <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <div>
                <p className="inline-flex rounded bg-orange-500 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-blue-950">
                  Matchday {match.matchNumber}
                </p>
                <h3 className="mt-1 text-xl font-black">{match.homeTeam.name}</h3>
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
            {!!match.playerStats?.length && (
              <div className="mt-4 grid gap-2 border-t border-white/10 pt-4 md:grid-cols-2">
                {match.playerStats.map((stat, index) => (
                  <p key={`${match.id}-${index}`} className="text-sm text-slate-300">
                    <span className="font-bold text-white">{stat.player.firstName} {stat.player.lastName}</span>
                    {' '}({stat.team.shortName}) - {stat.goals}G / {stat.assists}A
                  </p>
                ))}
              </div>
            )}
            <div className="mt-4 border-t border-white/10 pt-4">
              <label className="inline-flex items-center gap-2 text-sm font-bold text-slate-200">
                <input type="checkbox" checked={match.votingEnabled ?? true} onChange={() => toggleVoting(match)} />
                Dozvoli glasanje publike
              </label>
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
};
