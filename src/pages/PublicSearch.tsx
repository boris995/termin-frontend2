import { CalendarClock, Search, Shield, Trophy, UserRound } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, asArray, getApiErrorMessage, unwrap } from '../api/client';
import { useCardDesign } from '../components/CardDesignProvider';
import { ErrorPanel, Field, Input, PageTitle, Panel } from '../components/ui';
import { Match, Player, Season, Team } from '../types';
import { formatDateTime } from '../utils/date';
import { setSeo } from '../utils/seo';

interface SearchData {
  query: string;
  players: Player[];
  teams: Team[];
  seasons: Season[];
  matches: Match[];
}

const emptySearch: SearchData = { query: '', players: [], teams: [], seasons: [], matches: [] };

export const PublicSearch = () => {
  const { siteDesign } = useCardDesign();
  const [params, setParams] = useSearchParams();
  const initialQuery = params.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [data, setData] = useState<SearchData>(emptySearch);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isPremium = siteDesign === 'premium';

  const runSearch = async (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setData({ ...emptySearch, query: trimmed });
      return;
    }

    setLoading(true);
    try {
      const result = await api.get('/search', { params: { q: trimmed } }).then(unwrap<SearchData>);
      setData(result);
      setError('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Pretraga trenutno nije dostupna.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSeo('Pretraga | Duel Liga', 'Pretraga igraca, ekipa, sezona i rezultata Duel Lige.');
    runSearch(initialQuery);
  }, [initialQuery]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    setParams(trimmed ? { q: trimmed } : {});
    runSearch(trimmed);
  };

  const totalResults = asArray(data.players).length + asArray(data.teams).length + asArray(data.seasons).length + asArray(data.matches).length;
  const shell = isPremium ? 'min-h-screen bg-[#05070b] px-3 py-5 text-white sm:px-4 lg:px-8' : 'px-3 py-5 sm:px-4 lg:px-8';

  return (
    <main className={shell}>
      <div className="mx-auto max-w-6xl">
        <PageTitle eyebrow="Pretraga" title="Pronadji sve u ligi" />
        <Panel className="mb-5 p-4">
          <form className="grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={submit}>
            <Field label="Pojam za pretragu">
              <div className={`flex items-center gap-2 rounded border px-3 py-2 ${isPremium ? 'border-white/10 bg-[#0b0f17]' : 'border-[#504d43] bg-[#f4eddd]'}`}>
                <Search size={18} className={isPremium ? 'text-emerald-400' : 'text-[#8f332d]'} />
                <Input className="border-0 bg-transparent px-0 py-0 font-bold focus:border-transparent" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Igrac, ekipa, sezona, matchday..." />
              </div>
            </Field>
            <button className={`rounded px-5 py-2 text-sm font-black ${isPremium ? 'bg-emerald-400 text-slate-950' : 'border-2 border-[#504d43] bg-[#e7dfce] text-[#2d2c27]'}`} type="submit">
              Trazi
            </button>
          </form>
          {data.query && (
            <p className={`mt-3 text-sm ${isPremium ? 'text-slate-400' : 'text-[#504d43]'}`}>
              {loading ? 'Pretraga u toku...' : `${totalResults} rezultata za "${data.query}"`}
            </p>
          )}
        </Panel>

        {error && <div className="mb-5"><ErrorPanel message={error} /></div>}
        {!data.query && <Panel>Unesi najmanje dva znaka za pretragu.</Panel>}
        {data.query && !loading && totalResults === 0 && !error && <Panel>Nema rezultata za ovu pretragu.</Panel>}

        <div className="grid gap-5 lg:grid-cols-2">
          {!!asArray(data.players).length && (
            <Panel>
              <div className="mb-4 flex items-center gap-2">
                <UserRound size={19} className={isPremium ? 'text-emerald-400' : 'text-[#8f332d]'} />
                <h2 className="font-black">Igraci</h2>
              </div>
              <div className="space-y-2">
                {data.players.map((player) => (
                  <Link key={player.id} to={`/igraci/${player.id}`} className={`flex items-center justify-between rounded border p-3 ${isPremium ? 'border-white/10 bg-[#0b0f17] hover:border-emerald-400/40' : 'border-[#504d43] bg-[#f4eddd]'}`}>
                    <div>
                      <p className="font-black">{player.firstName} {player.lastName}</p>
                      <p className={`text-xs font-bold ${isPremium ? 'text-slate-400' : 'text-[#504d43]'}`}>{player.team?.shortName || 'Ekipa'} | {player.goals}G / {player.assists}A</p>
                    </div>
                    <span className={`text-lg font-black ${isPremium ? 'text-emerald-400' : 'text-[#8f332d]'}`}>{player.overallRating}</span>
                  </Link>
                ))}
              </div>
            </Panel>
          )}

          {!!asArray(data.matches).length && (
            <Panel>
              <div className="mb-4 flex items-center gap-2">
                <CalendarClock size={19} className={isPremium ? 'text-emerald-400' : 'text-[#8f332d]'} />
                <h2 className="font-black">Rezultati</h2>
              </div>
              <div className="space-y-2">
                {data.matches.map((match) => (
                  <Link key={match.id} to={`/rezultati/${match.id}`} className={`block rounded border p-3 ${isPremium ? 'border-white/10 bg-[#0b0f17] hover:border-emerald-400/40' : 'border-[#504d43] bg-[#f4eddd]'}`}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-black uppercase tracking-[0.14em]">Matchday {match.matchNumber}</p>
                      <p className={`text-xs ${isPremium ? 'text-slate-500' : 'text-[#504d43]'}`}>{formatDateTime(match.playedAt)}</p>
                    </div>
                    <p className="mt-2 text-lg font-black">{match.homeTeam?.shortName} {match.homeScore}:{match.awayScore} {match.awayTeam?.shortName}</p>
                  </Link>
                ))}
              </div>
            </Panel>
          )}

          {!!asArray(data.teams).length && (
            <Panel>
              <div className="mb-4 flex items-center gap-2">
                <Shield size={19} className={isPremium ? 'text-emerald-400' : 'text-[#8f332d]'} />
                <h2 className="font-black">Ekipe</h2>
              </div>
              <div className="space-y-2">
                {data.teams.map((team) => (
                  <div key={team.id} className={`rounded border p-3 ${isPremium ? 'border-white/10 bg-[#0b0f17]' : 'border-[#504d43] bg-[#f4eddd]'}`}>
                    <p className="font-black">{team.name}</p>
                    <p className={`text-xs font-bold ${isPremium ? 'text-slate-400' : 'text-[#504d43]'}`}>{team.shortName} | Sezona {team.seasonId}</p>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {!!asArray(data.seasons).length && (
            <Panel>
              <div className="mb-4 flex items-center gap-2">
                <Trophy size={19} className={isPremium ? 'text-emerald-400' : 'text-[#8f332d]'} />
                <h2 className="font-black">Sezone</h2>
              </div>
              <div className="space-y-2">
                {data.seasons.map((season) => (
                  <Link key={season.id} to={`/sezone/${season.id}`} className={`block rounded border p-3 ${isPremium ? 'border-white/10 bg-[#0b0f17] hover:border-emerald-400/40' : 'border-[#504d43] bg-[#f4eddd]'}`}>
                    <p className="font-black">{season.name}</p>
                    <p className={`text-xs font-bold ${isPremium ? 'text-slate-400' : 'text-[#504d43]'}`}>Status: {season.status} | Cilj: {season.winsToWinSeason}</p>
                  </Link>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </main>
  );
};
