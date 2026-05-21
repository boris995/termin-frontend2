import { CalendarClock, ChevronRight, MapPin, Newspaper, Radio, Shield, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, asArray, unwrap } from '../api/client';
import { useCardDesign } from '../components/CardDesignProvider';
import { ErrorPanel, PageTitle, Panel } from '../components/ui';
import { CmsBlock, HomeData, NextMatch } from '../types';
import { formatDateTime } from '../utils/date';
import { setSeo } from '../utils/seo';

export const PublicAnnouncement = () => {
  const { siteDesign } = useCardDesign();
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
  const isPremium = siteDesign === 'premium';

  if (isPremium) {
    return (
      <main className="min-h-screen bg-[#05070b] px-3 py-5 text-white sm:px-4 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <section className="relative overflow-hidden rounded-md border border-white/10 bg-[#10131b] p-5 sm:p-7">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:58px_58px]" />
            <div className="absolute left-1/2 top-0 h-full w-[34rem] -translate-x-1/2 bg-emerald-400/5 blur-3xl" />
            <div className="relative">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-400">Najava</p>
              <h1 className="mt-2 text-4xl font-black uppercase leading-none tracking-tight sm:text-5xl lg:text-7xl">
                {nextMatch?.status === 'live' ? 'Mec je u toku' : 'Sljedeci duel'}
              </h1>
            </div>

            {error && <div className="relative mt-5"><ErrorPanel message={error} /></div>}

            {nextMatch ? (
              <div className="relative mt-8 grid gap-8 lg:grid-cols-[1fr_0.8fr_1fr] lg:items-center">
                <div className="text-center lg:text-left">
                  <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-emerald-400/35 bg-emerald-400/10 text-2xl font-black text-emerald-400 lg:mx-0">
                    {nextMatch.homeTeam.shortName?.charAt(0) || nextMatch.homeTeam.name.charAt(0)}
                  </div>
                  <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500">{nextMatch.homeTeam.shortName}</p>
                  <h2 className="mt-1 text-3xl font-black uppercase text-white">{nextMatch.homeTeam.name}</h2>
                </div>

                <div className="text-center">
                  <div className="mx-auto inline-flex items-center gap-2 rounded-md border border-emerald-400/35 px-3 py-2 text-[0.65rem] font-black uppercase tracking-[0.22em] text-emerald-400">
                    {nextMatch.status === 'live' ? <Radio size={13} /> : <CalendarClock size={13} />}
                    {nextMatch.status === 'live' ? 'Uzivo' : 'Termin'}
                  </div>
                  <p className="mt-5 text-7xl font-black text-emerald-400">VS</p>
                  <p className="mt-2 text-sm font-black text-white">
                    {nextMatch.status === 'live' ? `Pocelo: ${formatDateTime(nextMatch.startedAt || nextMatch.scheduledAt)}` : formatDateTime(nextMatch.scheduledAt)}
                  </p>
                  {nextMatch.venue && (
                    <p className="mx-auto mt-3 inline-flex items-center gap-2 rounded-md bg-white/5 px-3 py-2 text-sm text-slate-300">
                      <MapPin size={15} />
                      {nextMatch.venue}
                    </p>
                  )}
                </div>

                <div className="text-center lg:text-right">
                  <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-white/20 bg-white/5 text-2xl font-black text-white lg:ml-auto lg:mr-0">
                    {nextMatch.awayTeam.shortName?.charAt(0) || nextMatch.awayTeam.name.charAt(0)}
                  </div>
                  <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500">{nextMatch.awayTeam.shortName}</p>
                  <h2 className="mt-1 text-3xl font-black uppercase text-white">{nextMatch.awayTeam.name}</h2>
                </div>
              </div>
            ) : (
              !error && <div className="relative mt-6 rounded-md border border-white/10 bg-[#0b0f17] p-5 text-slate-400">Nema najavljene utakmice iz backend-a.</div>
            )}
          </section>

          <section className="mt-5 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-md border border-white/10 bg-[#10131b] p-5">
              <div className="mb-4 flex items-center gap-3 text-emerald-400">
                <Trophy size={22} />
                <h2 className="text-xl font-black uppercase text-white">Sta treba pratiti</h2>
              </div>
              <div className="space-y-3">
                {[
                  'Forma pobjednika prosle utakmice i reakcija ekipe koja juri povratak u seriju.',
                  'Ucinak najboljih strijelaca, jer svaki gol direktno mijenja ritam duel lige.',
                  'Disciplinu u zavrsnici i odluke koje mogu prelomiti mec.'
                ].map((item) => (
                  <div key={item} className="flex gap-3 rounded-md border border-white/10 bg-[#0b0f17] p-3 text-sm leading-6 text-slate-300">
                    <Shield className="mt-1 shrink-0 text-emerald-400" size={16} />
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center gap-3">
                <Newspaper className="text-emerald-400" size={22} />
                <h2 className="text-xl font-black uppercase text-white">Novinski tekstovi</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {articles.map((article) => (
                  <article key={article.id} className="rounded-md border border-white/10 bg-[#10131b] p-5">
                    <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-emerald-400">{article.type}</p>
                    <h3 className="mt-2 text-2xl font-black text-white">{article.title}</h3>
                    <p className="mt-3 line-clamp-5 whitespace-pre-line text-sm leading-6 text-slate-400">{article.body}</p>
                    <p className="mt-4 inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.16em] text-emerald-400">
                      Procitaj <ChevronRight size={15} />
                    </p>
                  </article>
                ))}
                {!articles.length && <div className="rounded-md border border-white/10 bg-[#10131b] p-5 text-slate-400">Nema CMS tekstova iz backend-a.</div>}
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

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

