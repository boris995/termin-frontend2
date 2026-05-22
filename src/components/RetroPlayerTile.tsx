import { useState } from 'react';
import { Link } from 'react-router-dom';
import { assetUrl } from '../api/assets';
import { Player } from '../types';

const galleryImages = (value?: string[] | string | null) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(/[\s,]+/).map((item) => item.trim()).filter(Boolean);
  return [];
};

const playerImage = (player: Player) => {
  const image = player.cardImageUrl || '';
  if (image && !image.includes('/player-assets/player-card.svg')) return image;
  return galleryImages(player.galleryImages)[0] || '/player-assets/player-photo.svg';
};

const retroPlayerPlaceholder = (player: Player) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 560">
      <defs>
        <filter id="grain">
          <feTurbulence baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer><feFuncA type="table" tableValues="0 0.2"/></feComponentTransfer>
        </filter>
        <linearGradient id="shirt" x1="0" x2="1">
          <stop offset="0" stop-color="#f4eddd"/>
          <stop offset="1" stop-color="#bdb4a4"/>
        </linearGradient>
      </defs>
      <rect width="520" height="560" fill="#cfc6b5"/>
      <rect width="520" height="560" filter="url(#grain)" opacity="0.45"/>
      <circle cx="260" cy="156" r="84" fill="#2d2c27"/>
      <path d="M110 560c22-170 82-252 150-252s128 82 150 252z" fill="url(#shirt)"/>
      <path d="M172 560c12-108 44-166 88-166s76 58 88 166z" fill="#2d2c27" opacity="0.22"/>
      <circle cx="382" cy="366" r="62" fill="none" stroke="#8f332d" stroke-width="10"/>
      <circle cx="382" cy="366" r="36" fill="none" stroke="#8f332d" stroke-width="4" opacity="0.65"/>
      <path d="M347 366h70M382 331v70" stroke="#8f332d" stroke-width="4" opacity="0.4"/>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const retroImageSrc = (player: Player) => {
  const raw = playerImage(player);
  if (raw.startsWith('/player-assets/player-photo.svg')) return retroPlayerPlaceholder(player);
  return assetUrl(raw);
};

const positionLabel = (position: Player['position']) => {
  if (position === 'golman') return 'Golman';
  if (position === 'golman-igrac') return 'Golman';
  return 'Igrac';
};

const ratingKeys = [
  ['PAC', 'pac'],
  ['SHO', 'sho'],
  ['PAS', 'pas'],
  ['DRI', 'dri'],
  ['DEF', 'def'],
  ['PHY', 'phy']
] as const;

export const RetroPlayerTile = ({ player, compact = false }: { player: Player; compact?: boolean }) => {
  const [failed, setFailed] = useState(false);
  const src = failed ? retroPlayerPlaceholder(player) : retroImageSrc(player);
  const audienceRating = player.audienceRating ? player.audienceRating.toFixed(1) : '-';

  return (
    <Link
      to={`/igraci/${player.id}`}
      className="group block rounded-[0.45rem] border-2 border-[#504d43] bg-[#d8d2c3] p-1.5 shadow-[3px_3px_0_rgba(80,77,67,0.18)] transition hover:-translate-y-0.5 hover:bg-[#e7dfce] sm:p-2"
    >
      <div className="flex items-center justify-between border-b border-[#504d43] px-1 pb-1 text-[#504d43]">
        <p className={`${compact ? 'text-[0.68rem]' : 'text-xs sm:text-sm'} font-black uppercase`}>#{player.shirtNumber}</p>
        <p className={`${compact ? 'max-w-[4rem] text-[0.48rem]' : 'max-w-[4.7rem] text-[0.52rem] sm:max-w-[7rem] sm:text-[0.62rem]'} truncate font-black uppercase tracking-[0.08em]`}>
          {positionLabel(player.position)}
        </p>
      </div>
      <div className="relative mt-1.5 aspect-[1/1.08] overflow-hidden border border-[#504d43] bg-[#cfc6b5]">
        <div className="absolute left-1 top-1 z-10 grid h-7 w-7 place-items-center rounded-full border border-[#504d43] bg-[#ebe4d4] text-[0.55rem] font-black text-[#504d43]">
          DL
        </div>
        <img
          className="h-full w-full object-cover grayscale contrast-125 sepia"
          src={src}
          alt={`${player.firstName} ${player.lastName}`}
          onError={() => setFailed(true)}
        />
      </div>
      <div className="px-1 py-2 text-center">
        <p className={`${compact ? 'text-[0.58rem]' : 'text-[0.7rem] sm:text-xs'} truncate font-black uppercase tracking-[0.08em] text-[#504d43]`}>{player.firstName}</p>
        <h2 className={`${compact ? 'text-base' : 'text-lg sm:text-2xl'} truncate font-black uppercase leading-none text-[#2d2c27]`}>{player.lastName}</h2>
        <div className="mt-2 grid grid-cols-2 border-y border-[#504d43] text-center">
          <div className="border-r border-[#504d43] px-1 py-1">
            <p className="text-[0.46rem] font-black uppercase tracking-[0.08em] text-[#504d43]">Publika</p>
            <p className={`${compact ? 'text-sm' : 'text-base'} font-black text-[#8f332d]`}>{audienceRating}</p>
          </div>
          <div className="px-1 py-1">
            <p className="text-[0.46rem] font-black uppercase tracking-[0.08em] text-[#504d43]">FIFA</p>
            <p className={`${compact ? 'text-sm' : 'text-base'} font-black text-[#8f332d]`}>{player.overallRating}</p>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-x-2 gap-y-1 text-left">
          {ratingKeys.map(([label, key]) => (
            <div key={key} className="flex items-center justify-between gap-1">
              <span className="text-[0.45rem] font-black uppercase text-[#504d43]">{label}</span>
              <span className="text-[0.58rem] font-black text-[#8f332d]">{player[key]}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-center gap-2 text-[#8f332d]">
          <span className="h-px w-5 bg-[#504d43]" />
          <p className={`${compact ? 'max-w-[5rem] text-[0.48rem]' : 'max-w-[7rem] text-[0.58rem] sm:max-w-[9rem]'} truncate font-black uppercase tracking-[0.18em]`}>{player.team?.name || 'Duel'} F.C.</p>
          <span className="h-px w-5 bg-[#504d43]" />
        </div>
      </div>
    </Link>
  );
};
