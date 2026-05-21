import { ListOrdered } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, asArray, unwrap } from '../api/client';
import { ErrorPanel, PageTitle, Panel } from '../components/ui';
import { SeasonSelector } from '../components/SeasonSelector';
import { Match } from '../types';
import { formatDateTime } from '../utils/date';
import { setSeo } from '../utils/seo';

export const PublicResults = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teamFilter, setTeamFilter] = useState('all');
  const [seasonId, setSeasonId] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    setSeo('Rezultati | Duel Liga', 'Svi odigrani mecevi, pobjednici i rezultat po sezonama.');
    api.get(`/seasons/${seasonId}/matches`).then(unwrap<Match[]>).then((items) => {
      setMatches(asArray(items));
      setError('');
    }).catch((err) => setError(err.response?.data?.message || err.message || 'Backend ili baza nisu dostupni.'));
  }, [seasonId]);

  const teams = Array.from(new Map(asArray(matches).flatMap((match) => [match.homeTeam, match.awayTeam]).filter(Boolean).map((team) => [team.id, team])).values());
  const filteredMatches = asArray(matches).filter((match) => teamFilter === 'all' || String(match.homeTeam.id) === teamFilter || String(match.awayTeam.id) === teamFilter);

  return (
    <main className="px-3 py-5 sm:px-4 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <PageTitle eyebrow="Rezultati" title="Svi odigrani mecevi" />
        {error && <ErrorPanel message={error} />}
        <Panel className="p-3 sm:p-5">
          <div className="mb-5">
            <div className="grid gap-3 sm:flex sm:flex-wrap">
              <SeasonSelector value={seasonId} onChange={setSeasonId} />
              <select className="rounded border border-white/10 bg-blue-950/80 px-3 py-2 text-sm text-white outline-none focus:border-orange-400" value={teamFilter} onChange={(event) => setTeamFilter(event.target.value)}>
                <option value="all">Sve ekipe</option>
                {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-5 flex items-center gap-3 text-orange-300">
            <ListOrdered size={22} />
            <h2 className="text-xl font-black text-white">Match log</h2>
          </div>
          <div className="space-y-4">
            {filteredMatches.map((match) => (
              <Link key={match.id} to={`/rezultati/${match.id}`} className="block rounded-lg border border-white/10 bg-blue-950/70 p-4 transition hover:border-orange-300/50">
                <div className="flex items-center justify-between gap-3">
                  <p className="inline-flex rounded bg-orange-500 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-blue-950">
                    Matchday {match.matchNumber}
                  </p>
                  <p className="text-right text-xs font-bold text-slate-400">{formatDateTime(match.playedAt)}</p>
                </div>

                <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-start gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{match.homeTeam.shortName}</p>
                    <h3 className="mt-1 text-xl font-black leading-tight text-white">{match.homeTeam.name}</h3>
                  </div>
                  <div className="pt-6 text-xs font-black uppercase tracking-[0.16em] text-orange-300">vs</div>
                  <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{match.awayTeam.shortName}</p>
                    <h3 className="mt-1 text-xl font-black leading-tight text-white">{match.awayTeam.name}</h3>
                  </div>
                </div>

                <div className="mt-4 rounded bg-white/10 px-5 py-4 text-center text-5xl font-black leading-none text-white">
                  {match.homeScore}:{match.awayScore}
                </div>

                <p className="mt-3 text-center text-xs font-bold uppercase tracking-[0.16em] text-orange-300">
                  {match.winnerTeam ? `Pobjednik: ${match.winnerTeam.shortName}` : 'Nerijeseno'}
                </p>
              </Link>
            ))}
            {!filteredMatches.length && !error && <p className="text-slate-400">Nema rezultata iz backend-a.</p>}
          </div>
        </Panel>
      </div>
    </main>
  );
};

