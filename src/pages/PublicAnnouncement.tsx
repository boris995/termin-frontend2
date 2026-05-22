import { CalendarClock, ChevronRight, Clock, MapPin, Newspaper, Radio, Shield, Trophy } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { api, asArray, unwrap } from '../api/client';
import { useCardDesign } from '../components/CardDesignProvider';
import { ErrorPanel } from '../components/ui';
import { CmsBlock, HomeData, Match, NextMatch } from '../types';
import { formatDateTime } from '../utils/date';
import { setSeo } from '../utils/seo';

export const PublicAnnouncement = () => {
  const { siteDesign } = useCardDesign();
  const [nextMatch, setNextMatch] = useState<NextMatch | null>(null);
  const [articles, setArticles] = useState<CmsBlock[]>([]);
  const [lastMatches, setLastMatches] = useState<Match[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState('');

  useEffect(() => {
    setSeo('Najava | Duel Liga', 'Najava sljedece utakmice i novinski tekstovi.');
    api
      .get('/home')
      .then(unwrap<HomeData>)
      .then((data) => {
        if (data.nextMatch) setNextMatch(data.nextMatch);
        setArticles(asArray(data.contentBlocks));
        setLastMatches(asArray(data.lastMatches));
        setError('');
      })
      .catch((err) => setError(err.response?.data?.message || err.message || 'Backend ili baza nisu dostupni.'));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const isPremium = siteDesign === 'premium';
  const countdown = useMemo(() => getCountdown(nextMatch?.scheduledAt, now), [nextMatch?.scheduledAt, now]);
  const scheduledDate = nextMatch ? new Date(nextMatch.scheduledAt) : null;
  const matchDate = scheduledDate && !Number.isNaN(scheduledDate.getTime())
    ? scheduledDate.toLocaleDateString('sr-Latn-BA', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '--.--.----';
  const matchTime = scheduledDate && !Number.isNaN(scheduledDate.getTime())
    ? scheduledDate.toLocaleTimeString('sr-Latn-BA', { hour: '2-digit', minute: '2-digit' })
    : '--:--';
  const h2hMatches = lastMatches.slice(0, 3);

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
    <main className="min-h-screen overflow-x-hidden bg-[#d8d2c3] px-3 py-4 text-[#2d2c27] sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-5 space-y-1">
          <div className="h-px bg-[#2d2c27]" />
          <div className="h-px bg-[#2d2c27]" />
          <div className="h-px bg-[#2d2c27]" />
        </div>

        <header className="mb-5 text-center">
          <div className="flex items-center justify-center gap-4 text-[#9b382f] sm:gap-8">
            <span className="text-2xl">★</span>
            <h1 className="text-5xl font-black uppercase leading-none tracking-[0.08em] text-[#2f3030] sm:text-6xl lg:text-7xl">Najava</h1>
            <span className="text-2xl">★</span>
          </div>
          <div className="mx-auto mt-3 grid max-w-xl grid-cols-[1fr_auto_1fr] items-center gap-3">
            <span className="h-px bg-[#8d8476]" />
            <p className="text-sm font-black uppercase tracking-[0.24em] text-[#9b382f]">Utakmice</p>
            <span className="h-px bg-[#8d8476]" />
          </div>
        </header>

        {error && <div className="mb-4"><ErrorPanel message={error} /></div>}

        {nextMatch ? (
          <section className="rounded-[18px] border-2 border-[#504d43] bg-[#e8e0d0] p-3 shadow-[inset_0_0_0_2px_rgba(80,77,67,0.25)] sm:p-5 lg:p-7">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
              <span className="h-px bg-[#8d8476]" />
              <p className="text-sm font-black uppercase tracking-[0.12em] text-[#504d43]">
                ★ Duel Liga - {nextMatch.season?.number ? `${nextMatch.season.number}. sezona` : 'Sljedece kolo'} ★
              </p>
              <span className="h-px bg-[#8d8476]" />
            </div>

            <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-5">
              <RetroTeam teamName={nextMatch.homeTeam.name} shortName={nextMatch.homeTeam.shortName} tone="light" />
              <div className="text-center">
                <span className="mx-auto mb-3 block h-px w-16 bg-[#8d8476]" />
                <p className="text-5xl font-black uppercase leading-none tracking-[0.03em] text-[#9b382f] sm:text-6xl lg:text-7xl">VS</p>
                <span className="mx-auto mt-3 block h-px w-16 bg-[#8d8476]" />
              </div>
              <RetroTeam teamName={nextMatch.awayTeam.name} shortName={nextMatch.awayTeam.shortName} tone="dark" />
            </div>

            <div className="mt-6 grid border-2 border-[#b4aa98] text-center sm:grid-cols-3">
              <MatchFact icon={<CalendarClock size={24} />} label="Datum" value={matchDate} />
              <MatchFact icon={<Clock size={24} />} label={nextMatch.status === 'live' ? 'Pocelo' : 'Vrijeme'} value={nextMatch.status === 'live' ? formatDateTime(nextMatch.startedAt || nextMatch.scheduledAt) : matchTime} />
              <MatchFact icon={<MapPin size={24} />} label="Stadion" value={nextMatch.venue || 'Duel Arena'} />
            </div>

            <RetroDivider title={nextMatch.status === 'live' ? 'Utakmica je u toku' : 'Pocetak utakmice za'} />
            <div className="grid grid-cols-4 border-2 border-[#b4aa98] text-center">
              <CountdownBox value={countdown.days} label="Dana" />
              <CountdownBox value={countdown.hours} label="Sati" />
              <CountdownBox value={countdown.minutes} label="Minuta" />
              <CountdownBox value={countdown.seconds} label="Sekundi" />
            </div>

            <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
              <section>
                <RetroDivider title="Forma timova" />
                <div className="grid grid-cols-2 border-2 border-[#b4aa98] text-center">
                  <TeamForm title={nextMatch.homeTeam.shortName || nextMatch.homeTeam.name} pattern={['P', 'P', 'N', 'P', 'P']} />
                  <TeamForm title={nextMatch.awayTeam.shortName || nextMatch.awayTeam.name} pattern={['P', 'N', 'P', 'I', 'P']} />
                </div>
                <RetroDivider title="Medjusobni susreti" />
                <div className="border-2 border-[#b4aa98]">
                  {h2hMatches.length ? h2hMatches.map((match) => (
                    <div key={match.id} className="grid grid-cols-[1fr_1fr_auto_1fr_auto] items-center gap-2 border-b border-[#b4aa98] px-3 py-3 text-[0.7rem] font-black uppercase last:border-b-0 sm:text-xs">
                      <span>{new Date(match.playedAt).toLocaleDateString('sr-Latn-BA')}</span>
                      <span className="text-right">{match.homeTeam.shortName}</span>
                      <span className="text-base text-[#9b382f]">{match.homeScore}:{match.awayScore}</span>
                      <span>{match.awayTeam.shortName}</span>
                      <ChevronRight size={15} />
                    </div>
                  )) : (
                    <p className="px-3 py-4 text-sm font-bold text-[#504d43]">Nema prethodnih susreta iz backend-a.</p>
                  )}
                </div>
              </section>

              <section>
                <RetroDivider title="Sta treba pratiti" />
                <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-1">
                  {[
                    'Forma pobjednika prosle utakmice i reakcija ekipe koja juri povratak u seriju.',
                    'Ucinak najboljih strijelaca, jer svaki gol direktno mijenja ritam Duel Lige.',
                    nextMatch.note || 'Disciplina u zavrsnici moze prelomiti mec.'
                  ].map((item) => (
                    <div key={item} className="flex gap-3 border-2 border-[#b4aa98] bg-[#dfd6c5] p-3 text-sm font-semibold leading-6 text-[#504d43]">
                      <Shield className="mt-1 shrink-0 text-[#9b382f]" size={18} />
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </section>
        ) : (
          !error && <section className="rounded-[18px] border-2 border-[#504d43] bg-[#e8e0d0] p-6 text-center font-black uppercase">Nema najavljene utakmice iz backend-a.</section>
        )}

        <section className="mt-6">
          <div className="mb-4 flex items-center justify-center gap-3 text-[#2f3030]">
            <Newspaper className="text-[#9b382f]" size={22} />
            <h2 className="text-2xl font-black uppercase tracking-[0.08em]">Novinski tekstovi</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {articles.map((article) => (
              <article key={article.id} className="rounded-[3px] border-2 border-[#504d43] bg-[#e8e0d0] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.32)]">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9b382f]">{article.type}</p>
                <h3 className="mt-2 text-2xl font-black uppercase text-[#2f3030]">{article.title}</h3>
                <p className="mt-3 line-clamp-5 whitespace-pre-line text-sm font-semibold leading-6 text-[#504d43]">{article.body}</p>
              </article>
            ))}
            {!articles.length && <div className="rounded-[3px] border-2 border-[#504d43] bg-[#e8e0d0] p-5 text-sm font-bold text-[#504d43]">Nema CMS tekstova iz backend-a.</div>}
          </div>
        </section>
      </div>
    </main>
  );
};

const getCountdown = (dateValue?: string, now = Date.now()) => {
  const target = dateValue ? new Date(dateValue).getTime() : Date.now();
  const diff = Math.max(target - now, 0);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1_000);
  return { days, hours, minutes, seconds };
};

const RetroDivider = ({ title }: { title: string }) => (
  <div className="my-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
    <span className="h-px bg-[#8d8476]" />
    <p className="text-sm font-black uppercase tracking-[0.12em] text-[#504d43]">★ {title} ★</p>
    <span className="h-px bg-[#8d8476]" />
  </div>
);

const RetroTeam = ({ teamName, shortName, tone }: { teamName: string; shortName?: string; tone: 'light' | 'dark' }) => (
  <div className="min-w-0 text-center">
    <div className={`mx-auto grid h-20 w-20 place-items-center rounded-b-[26px] rounded-t-md border-2 border-[#504d43] ${tone === 'dark' ? 'bg-[#393934]' : 'bg-[#d9d0bd]'} sm:h-28 sm:w-28`}>
      <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-[#504d43] bg-[#e8e0d0] sm:h-20 sm:w-20">
        <span className="text-lg font-black tracking-tight text-[#2f3030] sm:text-2xl">DL</span>
      </div>
    </div>
    <h2 className="mt-3 truncate text-2xl font-black uppercase tracking-[0.06em] text-[#2f3030] sm:text-3xl">{shortName || teamName}</h2>
    <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-[#9b382f]">{teamName}</p>
    <p className="mt-2 text-sm text-[#2f3030]">★★★★★</p>
  </div>
);

const MatchFact = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <div className="border-b border-[#b4aa98] p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
    <div className="mx-auto grid h-8 w-8 place-items-center text-[#504d43]">{icon}</div>
    <p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-[#504d43]">{label}</p>
    <p className="mt-1 break-words text-sm font-black uppercase text-[#9b382f] sm:text-base">{value}</p>
  </div>
);

const CountdownBox = ({ value, label }: { value: number; label: string }) => (
  <div className="border-r border-[#b4aa98] p-3 last:border-r-0 sm:p-5">
    <p className="text-3xl font-black leading-none text-[#9b382f] sm:text-5xl">{String(value).padStart(2, '0')}</p>
    <p className="mt-2 text-[0.66rem] font-black uppercase tracking-[0.08em] text-[#504d43] sm:text-sm">{label}</p>
  </div>
);

const TeamForm = ({ title, pattern }: { title: string; pattern: string[] }) => (
  <div className="border-r border-[#b4aa98] p-3 last:border-r-0">
    <p className="text-sm font-black uppercase tracking-[0.08em] text-[#504d43]">{title}</p>
    <div className="mt-3 grid grid-cols-5 gap-2">
      {pattern.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className={`grid h-8 place-items-center rounded-[1px] text-sm font-black text-[#f4eddd] ${
            item === 'P' ? 'bg-[#5f8d61]' : item === 'I' ? 'bg-[#9b382f]' : 'bg-[#7d776c]'
          }`}
        >
          {item}
        </span>
      ))}
    </div>
  </div>
);

