import { CalendarPlus, FilePlus, HeartHandshake, Pencil, Play, Save, Square, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { api, asArray, getApiErrorMessage, unwrap } from '../api/client';
import { useCardDesign } from '../components/CardDesignProvider';
import { Button, ErrorPanel, Field, Input, PageTitle, Panel, Select, Textarea } from '../components/ui';
import { AppSettings, CardDesign, CmsBlock, DonationPage, MatchTimelineEvent, NextMatch, Player, Season, SiteDesign, Team } from '../types';
import { formatDateTime } from '../utils/date';

interface BlockForm {
  title: string;
  body: string;
  type: 'text' | 'news' | 'announcement';
  imageUrl?: string;
  sortOrder: number;
}

interface NextMatchForm {
  seasonId: number;
  homeTeamId: number;
  awayTeamId: number;
  scheduledAt: string;
  venue?: string;
  note?: string;
}

type FinishForm = {
  homeScore: number;
  awayScore: number;
  votingEnabled: boolean;
  participants: number[];
  stats: Record<number, { goals: number; assists: number }>;
  reportSummary: string;
  timelineEvents: MatchTimelineEvent[];
};

const emptyTimelineEvent = (teamId?: number): MatchTimelineEvent => ({
  minute: '',
  type: 'goal',
  teamId: teamId || null,
  playerId: null,
  assistPlayerId: null,
  description: ''
});

const donationDefaults: DonationPage = {
  eyebrow: 'Podrzi ligu',
  title: 'Donacije za Duel Ligu',
  intro: 'Svaka donacija pomaze da utakmice imaju bolju organizaciju, kvalitetniju opremu i sadrzaj koji publika moze da prati iz kola u kolo.',
  impactTitle: 'Za sta se koristi podrska',
  impactBody: 'Donacije se koriste za termine, lopte, marker opremu, osnovnu medicinsku opremu, snimanje najzanimljivijih trenutaka i odrzavanje platforme sa rezultatima, statistikama i najavama.',
  paymentTitle: 'Kako mozes donirati',
  paymentBody: 'Uplatu mozes poslati direktno na racun lige ili kontaktirati administratore ako zelis da podrzis konkretan termin, opremu ili medijski sadrzaj.',
  bankAccount: 'RS35 0000 0000 0000 0000 00',
  recipientName: 'Duel Liga',
  paymentPurpose: 'Donacija za organizaciju lige',
  ctaLabel: 'Kontakt za donaciju',
  ctaUrl: 'mailto:admin@football.com',
  imageUrl: '',
  isPublished: true
};

export type CmsSection = 'settings' | 'donation' | 'content' | 'next-match' | 'blocks' | 'next-matches' | 'all';

export const Cms = ({ section = 'all' }: { section?: CmsSection }) => {
  const { cardDesign, siteDesign, setCardDesign, setSiteDesign } = useCardDesign();
  const [blocks, setBlocks] = useState<CmsBlock[]>([]);
  const [nextMatches, setNextMatches] = useState<NextMatch[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [editingBlock, setEditingBlock] = useState<CmsBlock | null>(null);
  const [showClassicHomeIntroSection, setShowClassicHomeIntroSection] = useState(false);
  const [error, setError] = useState('');
  const [finishForms, setFinishForms] = useState<Record<number, FinishForm>>({});
  const blockForm = useForm<BlockForm>({ defaultValues: { title: '', body: '', type: 'news', imageUrl: '', sortOrder: 0 } });
  const nextForm = useForm<NextMatchForm>({ defaultValues: { seasonId: 1, homeTeamId: 0, awayTeamId: 0, scheduledAt: '', venue: '', note: '' } });
  const donationForm = useForm<DonationPage>({ defaultValues: donationDefaults });

  const load = async (seasonOverride?: number) => {
    const [settings, donationPage, cmsBlocks, scheduled, seasonList] = await Promise.all([
      api.get('/cms/settings').then(unwrap<AppSettings>),
      api.get('/cms/donation-page').then(unwrap<DonationPage>),
      api.get('/cms/blocks').then(unwrap<CmsBlock[]>),
      api.get('/cms/next-matches').then(unwrap<NextMatch[]>),
      api.get('/seasons').then(unwrap<Season[]>)
    ]);
    const availableSeasons = asArray(seasonList);
    const selectedSeasonId = Number(
      seasonOverride ||
      nextForm.getValues('seasonId') ||
      availableSeasons.find((season) => season.status === 'active')?.id ||
      availableSeasons[0]?.id ||
      1
    );
    const [seasonTeams, seasonPlayers] = await Promise.all([
      api.get(`/seasons/${selectedSeasonId}/teams`).then(unwrap<Team[]>),
      api.get(`/seasons/${selectedSeasonId}/players`).then(unwrap<Player[]>)
    ]);
    const availableTeams = asArray(seasonTeams);
    setCardDesign(settings.cardDesign || 'standard');
    setSiteDesign(settings.siteDesign || 'classic');
    setShowClassicHomeIntroSection(Boolean(settings.showClassicHomeIntroSection));
    donationForm.reset({ ...donationDefaults, ...donationPage });
    setBlocks(asArray(cmsBlocks));
    setNextMatches(asArray(scheduled));
    setSeasons(availableSeasons);
    setTeams(availableTeams);
    setPlayers(asArray(seasonPlayers));
    const currentHomeId = Number(nextForm.getValues('homeTeamId'));
    const currentAwayId = Number(nextForm.getValues('awayTeamId'));
    const homeTeamId = availableTeams.some((team) => team.id === currentHomeId) ? currentHomeId : Number(availableTeams[0]?.id || 0);
    const awayTeamId = availableTeams.some((team) => team.id === currentAwayId && team.id !== homeTeamId)
      ? currentAwayId
      : Number(availableTeams.find((team) => team.id !== homeTeamId)?.id || 0);
    nextForm.setValue('seasonId', selectedSeasonId);
    nextForm.setValue('homeTeamId', homeTeamId);
    nextForm.setValue('awayTeamId', awayTeamId);
    setError('');
  };

  useEffect(() => {
    load().catch((err) => setError(getApiErrorMessage(err, 'CMS podaci nisu dostupni. Provjeri backend i seed.')));
  }, []);

  const submitBlock = async (values: BlockForm) => {
    const payload = { ...values, sortOrder: Number(values.sortOrder), isPublished: true };
    if (editingBlock) {
      await api.put(`/cms/blocks/${editingBlock.id}`, payload);
      setEditingBlock(null);
    } else {
      await api.post('/cms/blocks', payload);
    }
    blockForm.reset({ title: '', body: '', type: 'news', imageUrl: '', sortOrder: 0 });
    await load();
  };

  const saveCardDesign = async (design: CardDesign) => {
    const settings = unwrap<AppSettings>(await api.put('/cms/settings', { cardDesign: design }));
    setCardDesign(settings.cardDesign);
  };

  const saveSiteDesign = async (design: SiteDesign) => {
    const settings = unwrap<AppSettings>(await api.put('/cms/settings', { siteDesign: design }));
    setSiteDesign(settings.siteDesign || 'classic');
  };

  const saveShowClassicHomeIntroSection = async (isVisible: boolean) => {
    const settings = unwrap<AppSettings>(await api.put('/cms/settings', { showClassicHomeIntroSection: isVisible }));
    setShowClassicHomeIntroSection(Boolean(settings.showClassicHomeIntroSection));
  };

  const saveDonationPage = async (values: DonationPage) => {
    const saved = unwrap<DonationPage>(await api.put('/cms/donation-page', values));
    donationForm.reset({ ...donationDefaults, ...saved });
    setError('');
  };

  const startEditBlock = (block: CmsBlock) => {
    setEditingBlock(block);
    blockForm.reset({
      title: block.title,
      body: block.body,
      type: block.type,
      imageUrl: block.imageUrl || '',
      sortOrder: block.sortOrder
    });
  };

  const deleteBlock = async (block: CmsBlock) => {
    const confirmed = window.confirm(`Obrisati CMS blok "${block.title}"?`);
    if (!confirmed) return;
    await api.delete(`/cms/blocks/${block.id}`);
    await load();
  };

  const createNextMatch = async (values: NextMatchForm) => {
    try {
      const availableTeams = asArray(teams);
      const seasonId = Number(values.seasonId);
      const homeTeamId = Number(values.homeTeamId || availableTeams[0]?.id);
      const awayTeamId = Number(values.awayTeamId || availableTeams.find((team) => team.id !== homeTeamId)?.id);
      if (!seasonId) throw new Error('Izaberi sezonu za najavu.');
      if (availableTeams.length < 2) throw new Error('Izabrana sezona mora imati dvije ekipe prije najave utakmice.');
      if (!homeTeamId || !awayTeamId) throw new Error('Izaberi obje ekipe za najavu.');
      if (homeTeamId === awayTeamId) throw new Error('Ekipe za najavu moraju biti razlicite.');
      if (!values.scheduledAt) throw new Error('Termin utakmice je obavezan.');

      await api.post('/cms/next-matches', {
        ...values,
        seasonId,
        homeTeamId,
        awayTeamId,
        scheduledAt: new Date(values.scheduledAt).toISOString()
      });
      nextForm.reset({ seasonId, homeTeamId, awayTeamId, scheduledAt: '', venue: '', note: '' });
      await load(seasonId);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Najava utakmice nije sacuvana.'));
    }
  };

  const cancelNextMatch = async (match: NextMatch) => {
    await api.put(`/cms/next-matches/${match.id}`, { status: 'cancelled' });
    await load();
  };

  const startNextMatch = async (match: NextMatch) => {
    await api.post(`/cms/next-matches/${match.id}/start`);
    await load();
  };

  const updateFinishForm = (matchId: number, patch: Partial<FinishForm>) => {
    setFinishForms((current) => ({
      ...current,
      [matchId]: {
        homeScore: current[matchId]?.homeScore || 0,
        awayScore: current[matchId]?.awayScore || 0,
        votingEnabled: current[matchId]?.votingEnabled ?? true,
        participants: current[matchId]?.participants || [],
        stats: current[matchId]?.stats || {},
        reportSummary: current[matchId]?.reportSummary || '',
        timelineEvents: current[matchId]?.timelineEvents || [],
        ...patch
      }
    }));
  };

  const toggleParticipant = (match: NextMatch, player: Player) => {
    const form = finishForms[match.id] || { homeScore: 0, awayScore: 0, votingEnabled: true, participants: [], stats: {}, reportSummary: '', timelineEvents: [] };
    const participants = asArray(form.participants);
    const exists = participants.includes(player.id);
    updateFinishForm(match.id, {
      participants: exists ? participants.filter((id) => id !== player.id) : [...participants, player.id],
      stats: { ...form.stats, [player.id]: form.stats[player.id] || { goals: 0, assists: 0 } }
    });
  };

  const finishNextMatch = async (match: NextMatch) => {
    const form = finishForms[match.id] || { homeScore: 0, awayScore: 0, votingEnabled: true, participants: [], stats: {}, reportSummary: '', timelineEvents: [] };
    const playerStats = asArray(form.participants).map((playerId) => {
      const player = asArray(players).find((item) => item.id === playerId);
      return {
        playerId,
        teamId: player?.teamId,
        goals: Number(form.stats[playerId]?.goals || 0),
        assists: Number(form.stats[playerId]?.assists || 0)
      };
    });
    await api.post(`/cms/next-matches/${match.id}/finish`, {
      homeScore: Number(form.homeScore || 0),
      awayScore: Number(form.awayScore || 0),
      votingEnabled: form.votingEnabled,
      reportSummary: form.reportSummary,
      timelineEvents: form.timelineEvents.filter((event) => String(event.minute || '').trim()),
      playerStats
    });
    await load();
  };

  const showSettings = section === 'all' || section === 'settings';
  const showDonation = section === 'all' || section === 'donation';
  const showContentForm = section === 'all' || section === 'content';
  const showNextMatchForm = section === 'all' || section === 'next-match';
  const showBlocks = section === 'all' || section === 'blocks';
  const showNextMatches = section === 'all' || section === 'next-matches';
  const pageTitle = {
    all: 'CMS sadrzaj za home page',
    settings: 'Dizajn i postavke',
    donation: 'Donacija stranica',
    content: 'Dodaj sadrzaj',
    'next-match': 'Najava sljedece utakmice',
    blocks: 'Objavljeni blokovi',
    'next-matches': 'Najave utakmica'
  }[section];

  return (
    <>
      <PageTitle eyebrow="Content management" title={pageTitle} />
      {error && <ErrorPanel message={error} />}
      {showSettings && <Panel className="mb-5">
        <div className="grid gap-5 xl:grid-cols-2">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Kartice igraca</p>
            <h3 className="mt-1 text-xl font-black text-white">Dizajn kartica</h3>
            <div className="mt-4 grid grid-cols-2 gap-2 rounded border border-white/10 bg-slate-950/45 p-1">
              {(['standard', 'gold'] as CardDesign[]).map((design) => (
                <button
                  key={design}
                  type="button"
                  className={`rounded px-4 py-2 text-sm font-black uppercase tracking-[0.12em] transition ${
                    cardDesign === design ? 'bg-orange-500 text-blue-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                  onClick={() => saveCardDesign(design).catch((err) => setError(getApiErrorMessage(err, 'Dizajn kartice nije sacuvan.')))}
                >
                  {design === 'standard' ? 'Standard design' : 'Gold design'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Izgled sajta</p>
            <h3 className="mt-1 text-xl font-black text-white">Dizajn pocetne</h3>
            <div className="mt-4 grid grid-cols-2 gap-2 rounded border border-white/10 bg-slate-950/45 p-1">
              {(['classic', 'premium'] as SiteDesign[]).map((design) => (
              <button
                key={design}
                type="button"
                className={`rounded px-4 py-2 text-sm font-black uppercase tracking-[0.12em] transition ${
                  siteDesign === design ? 'bg-emerald-400 text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
                onClick={() => saveSiteDesign(design).catch((err) => setError(getApiErrorMessage(err, 'Dizajn sajta nije sacuvan.')))}
              >
                {design === 'classic' ? 'Classic' : 'Premium'}
              </button>
              ))}
            </div>
          </div>
          <div className="xl:col-span-2">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Classic home</p>
            <h3 className="mt-1 text-xl font-black text-white">Duel Liga uvodna sekcija</h3>
            <label className="mt-4 flex items-center justify-between gap-4 rounded border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-bold text-slate-200">
              <span>
                Prikazi staru Duel Liga sekciju na classic pocetnoj
                <span className="mt-1 block text-xs font-semibold text-slate-500">Default je iskljuceno. Nova najava utakmice ostaje na vrhu.</span>
              </span>
              <input
                type="checkbox"
                className="h-5 w-5 shrink-0"
                checked={showClassicHomeIntroSection}
                onChange={(event) =>
                  saveShowClassicHomeIntroSection(event.target.checked).catch((err) =>
                    setError(getApiErrorMessage(err, 'Postavka za classic home sekciju nije sacuvana.'))
                  )
                }
              />
            </label>
          </div>
        </div>
      </Panel>}
      {showDonation && <Panel className="mb-5">
        <div className="mb-4 border-b border-white/10 pb-3">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Donacije</p>
          <h3 className="mt-1 text-lg font-black">Sadrzaj javne donacija stranice</h3>
        </div>
        <form className="space-y-4" onSubmit={donationForm.handleSubmit((values) => saveDonationPage(values).catch((err) => setError(getApiErrorMessage(err, 'Donacija stranica nije sacuvana.'))))}>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Eyebrow tekst"><Input placeholder="Kratki uvod" {...donationForm.register('eyebrow', { required: true })} /></Field>
            <Field label="Naslov stranice"><Input placeholder="Naslov" {...donationForm.register('title', { required: true })} /></Field>
          </div>
          <Field label="Uvodni tekst"><Textarea className="min-h-24" placeholder="Uvodni tekst" {...donationForm.register('intro', { required: true })} /></Field>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Naslov bloka: uticaj"><Input placeholder="Uticaj donacije" {...donationForm.register('impactTitle', { required: true })} /></Field>
            <Field label="Naslov bloka: uplata"><Input placeholder="Kako se uplacuje" {...donationForm.register('paymentTitle', { required: true })} /></Field>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <Field label="Tekst o uticaju"><Textarea className="min-h-32" placeholder="Tekst o tome za sta se koristi donacija" {...donationForm.register('impactBody', { required: true })} /></Field>
            <Field label="Tekst za uplatu"><Textarea className="min-h-32" placeholder="Tekst za instrukcije uplate" {...donationForm.register('paymentBody', { required: true })} /></Field>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Primalac"><Input placeholder="Naziv primaoca" {...donationForm.register('recipientName')} /></Field>
            <Field label="Racun / IBAN"><Input placeholder="Broj racuna" {...donationForm.register('bankAccount')} /></Field>
            <Field label="Svrha uplate"><Input placeholder="Svrha" {...donationForm.register('paymentPurpose')} /></Field>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="CTA label"><Input placeholder="Tekst dugmeta" {...donationForm.register('ctaLabel')} /></Field>
            <Field label="CTA URL / mailto"><Input placeholder="Link dugmeta" {...donationForm.register('ctaUrl')} /></Field>
            <Field label="URL slike"><Input placeholder="Opcionalno" {...donationForm.register('imageUrl')} /></Field>
          </div>
          <label className="flex items-center gap-2 rounded border border-white/10 bg-slate-950/40 px-3 py-2 text-sm font-bold text-slate-200">
            <input type="checkbox" {...donationForm.register('isPublished')} />
            Stranica je objavljena
          </label>
          <Button type="submit" className="w-full md:w-auto">
            <Save size={18} />
            Sacuvaj donacija stranicu
          </Button>
        </form>
      </Panel>}
      <div className="space-y-5">
        {showContentForm && <Panel>
          <div className="mb-4 border-b border-white/10 pb-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">CMS blokovi</p>
            <h3 className="mt-1 text-lg font-black">{editingBlock ? 'Uredi sadrzaj' : 'Dodaj sadrzaj'}</h3>
          </div>
          <form className="space-y-3" onSubmit={blockForm.handleSubmit(submitBlock)}>
            <Field label="Naslov"><Input placeholder="Naslov bloka" {...blockForm.register('title', { required: true })} /></Field>
            <Field label="Tip bloka">
              <Select {...blockForm.register('type')}>
                <option value="news">Novost</option>
                <option value="announcement">Obavjestenje</option>
                <option value="text">Tekst</option>
              </Select>
            </Field>
            <Field label="URL slike"><Input placeholder="Opcionalno" {...blockForm.register('imageUrl')} /></Field>
            <Field label="Redoslijed"><Input type="number" placeholder="0" {...blockForm.register('sortOrder', { valueAsNumber: true })} /></Field>
            <Field label="Sadrzaj"><Textarea className="min-h-36" placeholder="Sadrzaj" {...blockForm.register('body', { required: true })} /></Field>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                <FilePlus size={18} />
                {editingBlock ? 'Sacuvaj izmjene' : 'Objavi blok'}
              </Button>
              {editingBlock && (
                <button
                  type="button"
                  className="rounded border border-white/10 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/10"
                  onClick={() => {
                    setEditingBlock(null);
                    blockForm.reset({ title: '', body: '', type: 'news', imageUrl: '', sortOrder: 0 });
                  }}
                >
                  Otkaži
                </button>
              )}
            </div>
          </form>
        </Panel>}

        {showNextMatchForm && <Panel>
          <div className="mb-4 border-b border-white/10 pb-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Najava meca</p>
            <h3 className="mt-1 text-lg font-black">Najavi sljedecu utakmicu</h3>
          </div>
          <form className="space-y-3" onSubmit={nextForm.handleSubmit(createNextMatch)}>
            <Field label="Sezona">
              <Select
                {...nextForm.register('seasonId', { valueAsNumber: true })}
                onChange={(event) => {
                  const seasonId = Number(event.target.value);
                  nextForm.setValue('seasonId', seasonId);
                  nextForm.setValue('homeTeamId', 0);
                  nextForm.setValue('awayTeamId', 0);
                  load(seasonId).catch((err) => setError(getApiErrorMessage(err, 'Ekipe za sezonu nisu ucitane.')));
                }}
              >
                {asArray(seasons).map((season) => (
                  <option key={season.id} value={season.id}>{season.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Domacin">
              <Select {...nextForm.register('homeTeamId', { valueAsNumber: true })}>
                <option value={0}>Izaberi domacina</option>
                {asArray(teams).map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Gost">
              <Select {...nextForm.register('awayTeamId', { valueAsNumber: true })}>
                <option value={0}>Izaberi gosta</option>
                {asArray(teams).map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Termin"><Input type="datetime-local" {...nextForm.register('scheduledAt', { required: true })} /></Field>
            <Field label="Lokacija"><Input placeholder="Lokacija" {...nextForm.register('venue')} /></Field>
            <Field label="Napomena"><Textarea className="min-h-24" placeholder="Napomena" {...nextForm.register('note')} /></Field>
            <Button type="submit" className="w-full">
              <CalendarPlus size={18} />
              Sacuvaj najavu
            </Button>
          </form>
        </Panel>}
      </div>

      <div className="mt-5 space-y-5">
        {showBlocks && <Panel>
          <div className="mb-4 border-b border-white/10 pb-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Pregled sadrzaja</p>
            <h3 className="mt-1 text-lg font-black">Objavljeni blokovi</h3>
          </div>
          <div className="space-y-3">
            {asArray(blocks).map((block) => (
              <div key={block.id} className="rounded border border-white/10 bg-blue-950/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-300">{block.type}</p>
                    <h4 className="mt-1 font-black">{block.title}</h4>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded bg-white/10 p-2 hover:bg-white/15" onClick={() => startEditBlock(block)} title="Uredi">
                      <Pencil size={16} />
                    </button>
                    <button className="rounded bg-red-500/80 p-2 hover:bg-red-500" onClick={() => deleteBlock(block)} title="Obrisi">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-400">{block.body}</p>
              </div>
            ))}
          </div>
        </Panel>}

        {showNextMatches && <Panel>
          <div className="mb-4 border-b border-white/10 pb-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Upravljanje najavama</p>
            <h3 className="mt-1 text-lg font-black">Najave utakmica</h3>
          </div>
          <div className="space-y-3">
            {asArray(nextMatches).map((match) => (
              <div key={match.id} className="rounded border border-white/10 bg-blue-950/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-black">{match.homeTeam?.shortName} vs {match.awayTeam?.shortName}</h4>
                    <p className="mt-2 text-sm text-slate-400">{formatDateTime(match.scheduledAt)}</p>
                    {match.venue && <p className="text-sm text-slate-400">{match.venue}</p>}
                    <p className="mt-1 text-xs uppercase tracking-widest text-orange-300">{match.status}</p>
                  </div>
                  {match.status !== 'cancelled' && (
                    <div className="flex flex-wrap justify-end gap-2">
                      {match.status === 'scheduled' && (
                        <button className="inline-flex items-center gap-2 rounded bg-orange-500 px-3 py-2 text-xs font-black text-blue-950 hover:bg-orange-400" onClick={() => startNextMatch(match)}>
                          <Play size={14} />
                          Pokreni sada
                        </button>
                      )}
                      <button className="rounded bg-white/10 px-3 py-2 text-xs font-bold hover:bg-white/15" onClick={() => cancelNextMatch(match)}>
                        Otkazi
                      </button>
                    </div>
                  )}
                </div>
                {match.status === 'live' && (
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <div className="mb-3 flex items-center gap-2 text-orange-300">
                      <Square size={16} />
                      <h5 className="font-black">Zavrsi mec i objavi rezultat</h5>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Field label={`${match.homeTeam?.shortName} golovi`}>
                        <Input type="number" min={0} placeholder="0" value={finishForms[match.id]?.homeScore ?? 0} onChange={(event) => updateFinishForm(match.id, { homeScore: Number(event.target.value) })} />
                      </Field>
                      <Field label={`${match.awayTeam?.shortName} golovi`}>
                        <Input type="number" min={0} placeholder="0" value={finishForms[match.id]?.awayScore ?? 0} onChange={(event) => updateFinishForm(match.id, { awayScore: Number(event.target.value) })} />
                      </Field>
                    </div>
                    <label className="mt-3 flex items-center gap-2 rounded border border-white/10 bg-slate-950/40 px-3 py-2 text-sm font-bold text-slate-200">
                      <input
                        type="checkbox"
                        checked={finishForms[match.id]?.votingEnabled ?? true}
                        onChange={(event) => updateFinishForm(match.id, { votingEnabled: event.target.checked })}
                      />
                      Dozvoli glasanje publike
                    </label>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      {[match.homeTeam, match.awayTeam].filter(Boolean).map((team) => (
                        <div key={team.id} className="rounded border border-white/10 bg-slate-950/40 p-3">
                          <h6 className="mb-3 text-sm font-black text-white">{team.name}</h6>
                          <div className="space-y-3">
                            {asArray(players).filter((player) => player.teamId === team.id).map((player) => {
                              const selected = asArray(finishForms[match.id]?.participants).includes(player.id);
                              return (
                                <div key={player.id} className="rounded bg-white/5 p-3">
                                  <label className="flex items-center gap-2 text-sm font-bold">
                                    <input type="checkbox" checked={selected} onChange={() => toggleParticipant(match, player)} />
                                    {player.firstName} {player.lastName}
                                  </label>
                                  {selected && (
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                      <Field label="Golovi">
                                        <Input type="number" min={0} placeholder="0" value={finishForms[match.id]?.stats[player.id]?.goals ?? 0} onChange={(event) =>
                                            updateFinishForm(match.id, {
                                              stats: {
                                                ...(finishForms[match.id]?.stats || {}),
                                                [player.id]: { ...(finishForms[match.id]?.stats[player.id] || { assists: 0 }), goals: Number(event.target.value) }
                                              }
                                            })
                                          } />
                                      </Field>
                                      <Field label="Asistencije">
                                        <Input type="number" min={0} placeholder="0" value={finishForms[match.id]?.stats[player.id]?.assists ?? 0} onChange={(event) =>
                                            updateFinishForm(match.id, {
                                              stats: {
                                                ...(finishForms[match.id]?.stats || {}),
                                                [player.id]: { ...(finishForms[match.id]?.stats[player.id] || { goals: 0 }), assists: Number(event.target.value) }
                                              }
                                            })
                                          } />
                                      </Field>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <Field label="Sazetak izvjestaja">
                        <Textarea className="min-h-24" placeholder="Kratak opis zavrsene utakmice" value={finishForms[match.id]?.reportSummary || ''} onChange={(event) => updateFinishForm(match.id, { reportSummary: event.target.value })} />
                      </Field>
                    </div>
                    <div className="mt-4 rounded border border-white/10 bg-slate-950/40 p-3">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Timeline</p>
                          <h6 className="font-black text-white">Golovi i dogadjaji po minutama</h6>
                        </div>
                        <button
                          type="button"
                          className="rounded bg-white/10 px-3 py-2 text-xs font-black hover:bg-white/15"
                          onClick={() => updateFinishForm(match.id, { timelineEvents: [...(finishForms[match.id]?.timelineEvents || []), emptyTimelineEvent(match.homeTeamId)] })}
                        >
                          Dodaj dogadjaj
                        </button>
                      </div>
                      <div className="space-y-3">
                        {(finishForms[match.id]?.timelineEvents || []).map((event, index) => (
                          <div key={`${match.id}-timeline-${index}`} className="grid gap-2 rounded border border-white/10 bg-blue-950/50 p-3 lg:grid-cols-[80px_140px_1fr_1fr_1fr_auto]">
                            <Input
                              value={event.minute}
                              placeholder="23'"
                              onChange={(item) => {
                                const events = [...(finishForms[match.id]?.timelineEvents || [])];
                                events[index] = { ...events[index], minute: item.target.value };
                                updateFinishForm(match.id, { timelineEvents: events });
                              }}
                            />
                            <Select
                              value={event.type}
                              onChange={(item) => {
                                const events = [...(finishForms[match.id]?.timelineEvents || [])];
                                events[index] = { ...events[index], type: item.target.value as MatchTimelineEvent['type'] };
                                updateFinishForm(match.id, { timelineEvents: events });
                              }}
                            >
                              <option value="goal">Gol</option>
                              <option value="yellow-card">Zuti karton</option>
                              <option value="red-card">Crveni karton</option>
                              <option value="note">Biljeska</option>
                            </Select>
                            <Select
                              value={event.teamId || ''}
                              onChange={(item) => {
                                const events = [...(finishForms[match.id]?.timelineEvents || [])];
                                events[index] = { ...events[index], teamId: item.target.value ? Number(item.target.value) : null };
                                updateFinishForm(match.id, { timelineEvents: events });
                              }}
                            >
                              <option value="">Ekipa</option>
                              {[match.homeTeam, match.awayTeam].filter(Boolean).map((team) => <option key={team.id} value={team.id}>{team.shortName}</option>)}
                            </Select>
                            <Select
                              value={event.playerId || ''}
                              onChange={(item) => {
                                const events = [...(finishForms[match.id]?.timelineEvents || [])];
                                events[index] = { ...events[index], playerId: item.target.value ? Number(item.target.value) : null };
                                updateFinishForm(match.id, { timelineEvents: events });
                              }}
                            >
                              <option value="">Igrac</option>
                              {asArray(players).map((player) => <option key={player.id} value={player.id}>{player.firstName} {player.lastName}</option>)}
                            </Select>
                            <Input
                              value={event.description || ''}
                              placeholder="Opis"
                              onChange={(item) => {
                                const events = [...(finishForms[match.id]?.timelineEvents || [])];
                                events[index] = { ...events[index], description: item.target.value };
                                updateFinishForm(match.id, { timelineEvents: events });
                              }}
                            />
                            <button
                              type="button"
                              className="rounded bg-red-500/80 px-3 py-2 text-xs font-black hover:bg-red-500"
                              onClick={() => updateFinishForm(match.id, { timelineEvents: (finishForms[match.id]?.timelineEvents || []).filter((_, itemIndex) => itemIndex !== index) })}
                            >
                              Obrisi
                            </button>
                          </div>
                        ))}
                        {!(finishForms[match.id]?.timelineEvents || []).length && <p className="text-sm text-slate-400">Timeline mozes dodati odmah ili kasnije u editovanju utakmice.</p>}
                      </div>
                    </div>
                    <Button type="button" className="mt-4 w-full" onClick={() => finishNextMatch(match)} disabled={!asArray(finishForms[match.id]?.participants).length}>
                      Objavi zavrseni mec
                    </Button>
                  </div>
                )}
                {match.status === 'completed' && match.matchId && (
                  <p className="mt-3 text-sm text-slate-300">Objavljeno kao Matchday {match.match?.matchNumber || match.matchId}.</p>
                )}
              </div>
            ))}
          </div>
        </Panel>}
      </div>
    </>
  );
};
