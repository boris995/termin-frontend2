import { ArrowLeft, Shield, Trophy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, unwrap } from '../api/client';
import { assetUrl } from '../api/assets';
import { GoldPlayerCard } from '../components/GoldPlayerCard';
import { Panel } from '../components/ui';
import { fallbackPlayers } from '../data/fallback';
import { Player } from '../types';
import { setSeo } from '../utils/seo';

const ratingKeys = [
  ['PAC', 'pac'],
  ['SHO', 'sho'],
  ['PAS', 'pas'],
  ['DRI', 'dri'],
  ['DEF', 'def'],
  ['PHY', 'phy']
] as const;

export const PublicPlayerDetail = () => {
  const { id = '1' } = useParams();
  const fallback = useMemo(() => fallbackPlayers.find((player) => player.id === Number(id)) || fallbackPlayers[0], [id]);
  const [player, setPlayer] = useState<Player>(fallback);

  useEffect(() => {
    setSeo(`${fallback.firstName} ${fallback.lastName} | Football Face-Off`, `Profil igraca ${fallback.firstName} ${fallback.lastName}, ocjene i galerija.`);
    api.get(`/players/${id}`).then(unwrap<Player>).then(setPlayer).catch(() => setPlayer(fallback));
  }, [fallback, id]);

  const gallery = player.galleryImages?.length ? player.galleryImages : ['/player-assets/player-photo.svg?photo=1', '/player-assets/player-photo.svg?photo=2'];

  return (
    <main className="px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link to="/igraci" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-orange-300 hover:text-orange-200">
          <ArrowLeft size={17} />
          Nazad na igrace
        </Link>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <GoldPlayerCard player={player} large />

          <div className="space-y-6">
            <Panel>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">{player.team?.name || 'Ekipa'}</p>
                  <h2 className="mt-2 text-4xl font-black">{player.firstName} {player.lastName}</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded border border-white/10 bg-blue-950/70 px-4 py-3 text-center">
                    <p className="text-2xl font-black">{player.goals}</p>
                    <p className="text-xs uppercase tracking-widest text-slate-400">Golovi</p>
                  </div>
                  <div className="rounded border border-white/10 bg-blue-950/70 px-4 py-3 text-center">
                    <p className="text-2xl font-black">{player.assists}</p>
                    <p className="text-xs uppercase tracking-widest text-slate-400">Asistencije</p>
                  </div>
                </div>
              </div>
            </Panel>

            <Panel>
              <div className="mb-5 flex items-center gap-3 text-orange-300">
                <Trophy size={22} />
                <h2 className="text-xl font-black text-white">Ocjene</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ratingKeys.map(([label, key]) => (
                  <div key={key} className="rounded border border-white/10 bg-blue-950/70 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-black">{label}</p>
                      <p className="text-2xl font-black text-orange-300">{player[key]}</p>
                    </div>
                    <div className="h-2 overflow-hidden rounded bg-slate-800">
                      <div className="h-full rounded bg-orange-500" style={{ width: `${player[key]}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel>
              <div className="mb-5 flex items-center gap-3 text-orange-300">
                <Shield size={22} />
                <h2 className="text-xl font-black text-white">Galerija</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {gallery.map((image, index) => (
                  <img key={image} className="aspect-[4/3] w-full rounded object-cover" src={assetUrl(image)} alt={`${player.firstName} ${player.lastName} ${index + 1}`} />
                ))}
              </div>
            </Panel>
          </div>
        </section>
      </div>
    </main>
  );
};
