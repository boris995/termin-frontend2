import { CalendarClock, MapPin, Newspaper } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, asArray, unwrap } from '../api/client';
import { ErrorPanel, PageTitle, Panel } from '../components/ui';
import { CmsBlock, HomeData, NextMatch } from '../types';
import { formatDateTime } from '../utils/date';
import { setSeo } from '../utils/seo';

export const PublicAnnouncement = () => {
  const [nextMatch, setNextMatch] = useState<NextMatch | null>(null);
  const [articles, setArticles] = useState<CmsBlock[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setSeo('Najava | Duel Liga', 'Najava sljedece utakmice i novinski tekstovi.');
    api
      .get('/home')
      .then(unwrap<HomeData>)
      .then((data) => {
        if (data.nextMatch) setNextMatch(data.nextMatch);
        setArticles(asArray(data.contentBlocks));
        setError('');
      })
      .catch((err) => setError(err.response?.data?.message || err.message || 'Backend ili baza nisu dostupni.'));
  }, []);

  return (
    <main className="px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <PageTitle eyebrow="Najava" title={nextMatch?.status === 'live' ? 'Mec je u toku' : 'Sljedeca utakmica i najave kola'} />
        {error && <ErrorPanel message={error} />}
        {!error && !nextMatch && <Panel className="mb-6">Nema najavljene utakmice iz backend-a.</Panel>}
        <section className="mb-6 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          {nextMatch && <Panel className="p-6">
            <div className="mb-5 flex items-center gap-3 text-orange-300">
              <CalendarClock size={22} />
              <h2 className="text-xl font-black text-white">{nextMatch.status === 'live' ? 'Duel u toku' : 'Sljedeci duel'}</h2>
            </div>
            <p className="text-sm font-bold text-orange-300">
              {nextMatch.status === 'live' ? `Pocelo: ${formatDateTime(nextMatch.startedAt || nextMatch.scheduledAt)}` : formatDateTime(nextMatch.scheduledAt)}
            </p>
            <h3 className="mt-3 text-4xl font-black">{nextMatch.homeTeam.name} vs {nextMatch.awayTeam.name}</h3>
            {nextMatch.venue && (
              <p className="mt-4 inline-flex items-center gap-2 rounded bg-white/10 px-3 py-2 text-sm text-slate-200">
                <MapPin size={16} />
                {nextMatch.venue}
              </p>
            )}
            {nextMatch.status === 'live' && <p className="mt-5 text-orange-200">Utakmica traje dok admin ne zaustavi mec i objavi rezultat.</p>}
            {nextMatch.note && <p className="mt-5 text-slate-300">{nextMatch.note}</p>}
          </Panel>}

          <Panel>
            <h2 className="mb-4 text-xl font-black">Sta treba pratiti</h2>
            <div className="space-y-3 text-sm leading-6 text-slate-300">
              <p>Forma pobjednika prosle utakmice i reakcija ekipe koja juri povratak u seriju.</p>
              <p>Ucinak najboljih strijelaca, jer svaki gol direktno mijenja ritam duel lige.</p>
              <p>Disciplinu u zavrsnici, posto u ovom sistemu nema remija i nema prostora za kalkulacije.</p>
            </div>
          </Panel>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-3">
            <Newspaper className="text-orange-300" size={22} />
            <h2 className="text-2xl font-black">Novinski tekstovi</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {articles.map((article) => (
              <Panel key={article.id}>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-300">{article.type}</p>
                <h3 className="mt-2 text-2xl font-black">{article.title}</h3>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-300">{article.body}</p>
              </Panel>
            ))}
            {!articles.length && <Panel>Nema CMS tekstova iz backend-a.</Panel>}
          </div>
        </section>
      </div>
    </main>
  );
};

