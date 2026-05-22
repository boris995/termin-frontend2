import { ArrowLeft, Download, ListOrdered, Trophy, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, asArray, unwrap } from '../api/client';
import { ErrorPanel, Panel, StatPill } from '../components/ui';
import { Match, Player, Season, Team } from '../types';
import { formatDateTime } from '../utils/date';
import { setSeo } from '../utils/seo';

export const PublicSeasonDetail = () => {
  const { id = '1' } = useParams();
  const [season, setSeason] = useState<Season | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      const [seasonData, teamData, playerData, matchData] = await Promise.all([
        api.get(`/seasons/${id}`).then(unwrap<Season>),
        api.get(`/seasons/${id}/teams`).then(unwrap<Team[]>),
        api.get(`/seasons/${id}/players`).then(unwrap<Player[]>),
        api.get(`/seasons/${id}/matches`).then(unwrap<Match[]>)
      ]);
      setSeason(seasonData);
      setTeams(asArray(teamData));
      setPlayers(asArray(playerData));
      setMatches(asArray(matchData));
      setError('');
      setSeo(`${seasonData.name} | Duel Liga`, 'Timovi, igraci i rezultati izabrane sezone.');
    };
    load().catch((err) => setError(err.response?.data?.message || err.message || 'Backend ili baza nisu dostupni.'));
  }, [id]);

  const topScorer = [...players].sort((a, b) => b.goals - a.goals)[0];
  const totalGoals = matches.reduce((sum, match) => sum + match.homeScore + match.awayScore, 0);
  const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';

  return (
    <main className="px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link to="/sezone" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-orange-300 hover:text-orange-200">
          <ArrowLeft size={17} />
          Nazad na sezone
        </Link>
        {error && <ErrorPanel message={error} />}
        {!season && !error && <Panel>Ucitavanje sezone iz backend-a...</Panel>}
        {season && (
          <>
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">Sezona #{season.number}</p>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-4xl font-black text-white md:text-5xl">{season.name}</h1>
            <a
              className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/10 px-4 py-2 text-sm font-black text-white hover:border-orange-300/50"
              href={`${apiBaseUrl}/seasons/${season.id}/export.html`}
              target="_blank"
              rel="noreferrer"
            >
              <Download size={17} />
              Export HTML
            </a>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <StatPill label="Status" value={season.status} />
          <StatPill label="Cilj pobjeda" value={season.winsToWinSeason} />
          <StatPill label="Odigrano" value={matches.length} />
          <StatPill label="Golovi" value={totalGoals} />
        </div>

        <section className="grid gap-5 lg:grid-cols-2">
          {teams.map((team) => {
            const teamPlayers = players.filter((player) => player.teamId === team.id);
            const wins = matches.filter((match) => match.winnerTeam?.id === team.id).length;
            return (
              <Panel key={team.id}>
                <div className="mb-4 h-2 rounded" style={{ backgroundColor: team.primaryColor || '#F97316' }} />
                <div className="flex items-start gap-4">
                  {team.logoUrl ? (
                    <img className="h-16 w-16 rounded border border-white/10 object-cover" src={team.logoUrl} alt={team.name} />
                  ) : (
                    <div className="grid h-16 w-16 place-items-center rounded border border-white/10 bg-white/10 text-lg font-black">{team.shortName}</div>
                  )}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{team.shortName}</p>
                    <h2 className="text-3xl font-black">{team.name}</h2>
                    {team.representativeName && <p className="mt-2 text-sm text-slate-300">Predstavnik: {team.representativeName}</p>}
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <StatPill label="Pobjede" value={wins} />
                  <StatPill label="Igraci" value={teamPlayers.length} />
                </div>
                <div className="mt-5 grid gap-2">
                  {teamPlayers.map((player) => (
                    <Link key={player.id} to={`/igraci/${player.id}`} className="flex items-center justify-between rounded border border-white/10 bg-blue-950/60 px-3 py-2 text-sm transition hover:border-orange-300/50">
                      <span className="font-bold">{player.firstName} {player.lastName}</span>
                      <span className="text-slate-400">#{player.shirtNumber} · {player.goals}G/{player.assists}A</span>
                    </Link>
                  ))}
                </div>
              </Panel>
            );
          })}
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <Panel>
            <div className="mb-4 flex items-center gap-3 text-orange-300">
              <Users size={22} />
              <h2 className="text-xl font-black text-white">Igraci sezone</h2>
            </div>
            {topScorer && (
              <div className="mb-4 rounded border border-orange-300/30 bg-orange-500/10 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-300">Top strijelac</p>
                <h3 className="mt-1 text-2xl font-black">{topScorer.firstName} {topScorer.lastName}</h3>
                <p className="mt-1 text-sm text-slate-300">{topScorer.team?.shortName} · {topScorer.goals} golova</p>
              </div>
            )}
            <div className="space-y-2">
              {players.map((player) => (
                <Link key={player.id} to={`/igraci/${player.id}`} className="flex items-center justify-between rounded bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
                  <span>{player.firstName} {player.lastName}</span>
                  <span className="font-black text-orange-300">{player.overallRating}</span>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel>
            <div className="mb-4 flex items-center gap-3 text-orange-300">
              <ListOrdered size={22} />
              <h2 className="text-xl font-black text-white">Svi rezultati</h2>
            </div>
            <div className="space-y-3">
              {matches.map((match) => (
                <Link key={match.id} to={`/rezultati/${match.id}`} className="grid gap-3 rounded border border-white/10 bg-blue-950/70 p-4 transition hover:border-orange-300/50 md:grid-cols-[1fr_auto_1fr_auto] md:items-center">
                  <div>
                    <p className="inline-flex rounded bg-orange-500 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-blue-950">
                      Matchday {match.matchNumber}
                    </p>
                    <h3 className="mt-1 font-black">{match.homeTeam.name}</h3>
                  </div>
                  <div className="rounded bg-white/10 px-4 py-2 text-center text-2xl font-black">{match.homeScore}:{match.awayScore}</div>
                  <div className="md:text-right">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-300">{match.winnerTeam ? `Pobjednik: ${match.winnerTeam.shortName}` : 'Nerijeseno'}</p>
                    <h3 className="mt-1 font-black">{match.awayTeam.name}</h3>
                  </div>
                  <p className="text-sm text-slate-400 md:text-right">{formatDateTime(match.playedAt)}</p>
                </Link>
              ))}
              {!matches.length && <p className="text-slate-400">Ova sezona jos nema odigranih meceva.</p>}
            </div>
          </Panel>
        </section>

        <div className="mt-8 flex items-center gap-3 text-orange-300">
          <Trophy size={22} />
          <p className="text-sm font-black uppercase tracking-[0.18em]">Arhiva sezone</p>
        </div>
          </>
        )}
      </div>
    </main>
  );
};
