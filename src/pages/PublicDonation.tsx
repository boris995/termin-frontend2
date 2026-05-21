import { Banknote, HeartHandshake, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, getApiErrorMessage, unwrap } from '../api/client';
import { assetUrl } from '../api/assets';
import { useCardDesign } from '../components/CardDesignProvider';
import { DonationPage } from '../types';

const fallbackDonation: DonationPage = {
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

export const PublicDonation = () => {
  const { siteDesign } = useCardDesign();
  const [page, setPage] = useState<DonationPage>(fallbackDonation);
  const [error, setError] = useState('');
  const isPremium = siteDesign === 'premium';

  useEffect(() => {
    api.get('/cms/donation-page')
      .then(unwrap<DonationPage>)
      .then((data) => setPage({ ...fallbackDonation, ...data }))
      .catch((err) => setError(getApiErrorMessage(err, 'Donacija stranica trenutno nije dostupna.')));
  }, []);

  if (!page.isPublished) {
    return (
      <main className={`min-h-screen px-4 py-10 ${isPremium ? 'bg-[#05070b] text-white' : 'bg-[#d8d2c3] text-[#2d2c27]'}`}>
        <section className={`mx-auto max-w-3xl rounded-md border p-6 text-center ${isPremium ? 'border-white/10 bg-[#10131b]' : 'border-[#504d43] bg-[#ebe4d4]'}`}>
          <HeartHandshake className={`mx-auto ${isPremium ? 'text-emerald-400' : 'text-[#8f332d]'}`} size={34} />
          <h1 className="mt-4 text-2xl font-black uppercase">Donacije trenutno nisu aktivne</h1>
        </section>
      </main>
    );
  }

  const image = assetUrl(page.imageUrl || '');
  const ctaIsMail = page.ctaUrl?.startsWith('mailto:');

  if (isPremium) {
    return (
      <main className="min-h-screen bg-[#05070b] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {error && <p className="mb-4 rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}
          <section className="grid gap-6 lg:min-h-[32rem] lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
            <div className="relative overflow-hidden rounded-md border border-white/10 bg-[#10131b] p-6 sm:p-8 lg:p-10">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:58px_58px]" />
              <div className="relative">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-400">{page.eyebrow}</p>
                <h1 className="mt-3 max-w-4xl text-4xl font-black uppercase leading-none sm:text-6xl lg:text-7xl">{page.title}</h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">{page.intro}</p>
                {page.ctaUrl && (
                  <a href={page.ctaUrl} className="mt-7 inline-flex items-center gap-2 rounded bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-emerald-300">
                    {ctaIsMail ? <Mail size={18} /> : <HeartHandshake size={18} />}
                    {page.ctaLabel || 'Doniraj'}
                  </a>
                )}
              </div>
            </div>
            <div className="overflow-hidden rounded-md border border-white/10 bg-[#10131b]">
              {image ? (
                <img src={image} alt="" className="h-full min-h-72 w-full object-cover" />
              ) : (
                <div className="grid h-full min-h-72 place-items-center bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.22),transparent_22rem),#0b0f17] p-8 text-center">
                  <div>
                    <HeartHandshake className="mx-auto text-emerald-400" size={68} />
                    <p className="mt-4 text-sm font-black uppercase tracking-[0.22em] text-slate-400">Community funded</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_390px]">
            <article className="rounded-md border border-white/10 bg-[#10131b] p-6 sm:p-8">
              <Sparkles className="text-emerald-400" size={26} />
              <h2 className="mt-4 text-2xl font-black uppercase">{page.impactTitle}</h2>
              <p className="mt-3 text-base leading-7 text-slate-300">{page.impactBody}</p>
            </article>
            <aside className="rounded-md border border-emerald-400/25 bg-emerald-400/10 p-6">
              <Banknote className="text-emerald-300" size={28} />
              <h2 className="mt-4 text-2xl font-black uppercase text-white">{page.paymentTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{page.paymentBody}</p>
              <div className="mt-5 space-y-3">
                {page.recipientName && <Info label="Primalac" value={page.recipientName} premium />}
                {page.bankAccount && <Info label="Racun" value={page.bankAccount} premium />}
                {page.paymentPurpose && <Info label="Svrha" value={page.paymentPurpose} premium />}
              </div>
            </aside>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#d8d2c3] px-4 py-8 text-[#2d2c27] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {error && <p className="mb-4 rounded border border-[#8f332d] bg-[#f4eddd] px-4 py-3 text-sm font-bold text-[#8f332d]">{error}</p>}
        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
          <div className="order-2 rounded-md border-2 border-[#504d43] bg-[#ebe4d4] p-6 shadow-[5px_5px_0_rgba(80,77,67,0.18)] sm:p-8 lg:order-1">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8f332d]">{page.eyebrow}</p>
            <h1 className="mt-3 text-4xl font-black uppercase leading-none sm:text-5xl lg:text-6xl">{page.title}</h1>
            <p className="mt-5 text-base leading-7 text-[#504d43] sm:text-lg">{page.intro}</p>
            {page.ctaUrl && (
              <a href={page.ctaUrl} className="mt-7 inline-flex items-center gap-2 rounded border-2 border-[#504d43] bg-[#8f332d] px-5 py-3 text-sm font-black text-[#f4eddd] hover:bg-[#6f2824]">
                {ctaIsMail ? <Mail size={18} /> : <HeartHandshake size={18} />}
                {page.ctaLabel || 'Doniraj'}
              </a>
            )}
          </div>
          <div className="order-1 overflow-hidden rounded-md border-2 border-[#504d43] bg-[#e7dfce] shadow-[5px_5px_0_rgba(80,77,67,0.18)] lg:order-2">
            {image ? (
              <img src={image} alt="" className="h-full min-h-64 w-full object-cover" />
            ) : (
              <div className="grid h-full min-h-64 place-items-center bg-[radial-gradient(rgba(45,44,39,0.13)_1px,transparent_1px)] bg-[size:10px_10px] p-8 text-center">
                <div>
                  <ShieldCheck className="mx-auto text-[#8f332d]" size={64} />
                  <p className="mt-4 text-sm font-black uppercase tracking-[0.18em] text-[#504d43]">Podrska zajednice</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="rounded-md border-2 border-[#504d43] bg-[#ebe4d4] p-6 shadow-[5px_5px_0_rgba(80,77,67,0.16)] sm:p-7">
            <Sparkles className="text-[#8f332d]" size={26} />
            <h2 className="mt-4 text-2xl font-black uppercase">{page.impactTitle}</h2>
            <p className="mt-3 text-base leading-7 text-[#504d43]">{page.impactBody}</p>
          </article>
          <aside className="rounded-md border-2 border-[#504d43] bg-[#e7dfce] p-6 shadow-[5px_5px_0_rgba(80,77,67,0.16)] sm:p-7">
            <Banknote className="text-[#8f332d]" size={28} />
            <h2 className="mt-4 text-2xl font-black uppercase">{page.paymentTitle}</h2>
            <p className="mt-3 text-base leading-7 text-[#504d43]">{page.paymentBody}</p>
            <div className="mt-5 space-y-3">
              {page.recipientName && <Info label="Primalac" value={page.recipientName} />}
              {page.bankAccount && <Info label="Racun" value={page.bankAccount} />}
              {page.paymentPurpose && <Info label="Svrha" value={page.paymentPurpose} />}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
};

const Info = ({ label, value, premium = false }: { label: string; value: string; premium?: boolean }) => (
  <div className={`rounded border px-4 py-3 ${premium ? 'border-white/10 bg-[#0b0f17]' : 'border-[#504d43] bg-[#f4eddd]'}`}>
    <p className={`text-[0.65rem] font-black uppercase tracking-[0.18em] ${premium ? 'text-slate-500' : 'text-[#8f332d]'}`}>{label}</p>
    <p className={`mt-1 break-words text-sm font-black ${premium ? 'text-white' : 'text-[#2d2c27]'}`}>{value}</p>
  </div>
);
