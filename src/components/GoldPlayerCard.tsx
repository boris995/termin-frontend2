import { useState } from 'react';
import type { CSSProperties } from 'react';
import { assetUrl } from '../api/assets';
import { useCardDesign } from './CardDesignProvider';
import { Player } from '../types';

const ratingKeys = ['pac', 'sho', 'pas', 'dri', 'def', 'phy'] as const;

const galleryImages = (value?: string[] | string | null) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value
      .split(/[\s,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const playerImage = (player: Player) => {
  const image = player.cardImageUrl || '';
  if (image && !image.includes('/player-assets/player-card.svg')) return image;
  return galleryImages(player.galleryImages)[0] || '/player-assets/player-photo.svg';
};

const initialsFor = (player: Player) => `${player.firstName?.[0] || ''}${player.lastName?.[0] || ''}` || '#';

const generatedPlayerPlaceholder = (player: Player) => {
  const initials = initialsFor(player);
  const teamColor = player.team?.primaryColor || '#8f332d';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1040">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#f4eddd"/>
          <stop offset="0.52" stop-color="#d8d2c3"/>
          <stop offset="1" stop-color="${teamColor}"/>
        </linearGradient>
        <radialGradient id="light" cx="50%" cy="22%" r="70%">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.72"/>
          <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="800" height="1040" fill="url(#bg)"/>
      <circle cx="400" cy="325" r="150" fill="#f4eddd" opacity="0.95"/>
      <path d="M190 1040c36-244 118-366 210-366s174 122 210 366z" fill="#2d2c27" opacity="0.72"/>
      <circle cx="400" cy="390" r="270" fill="url(#light)"/>
      <text x="400" y="360" text-anchor="middle" font-family="Arial, sans-serif" font-size="150" font-weight="900" fill="#2d2c27">${initials}</text>
      <text x="400" y="690" text-anchor="middle" font-family="Arial, sans-serif" font-size="46" font-weight="900" fill="#f4eddd">${player.shirtNumber}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const imageSrcFor = (player: Player) => {
  const raw = playerImage(player);
  if (raw.startsWith('/player-assets/player-photo.svg')) return generatedPlayerPlaceholder(player);
  return assetUrl(raw);
};

const PlayerCardImage = ({
  player,
  className,
  style,
  compact = false
}: {
  player: Player;
  className: string;
  style?: CSSProperties;
  compact?: boolean;
}) => {
  const [failed, setFailed] = useState(false);
  const src = imageSrcFor(player);

  if (!src || failed) {
    return (
      <div className={`${className} grid place-items-center`} style={style}>
        <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.55),transparent_12rem),linear-gradient(145deg,rgba(80,77,67,0.18),rgba(143,51,45,0.16))] text-center">
          <div className={`${compact ? 'h-16 w-16 text-2xl' : 'h-24 w-24 text-4xl'} grid place-items-center rounded-full border-2 border-current bg-white/35 font-black uppercase`}>
            {initialsFor(player)}
          </div>
          <p className={`${compact ? 'mt-2 text-[0.55rem]' : 'mt-4 text-[0.68rem]'} max-w-[80%] truncate font-black uppercase tracking-[0.14em] opacity-80`}>
            {player.firstName} {player.lastName}
          </p>
        </div>
      </div>
    );
  }

  return (
    <img
      className={className}
      style={style}
      src={src}
      alt={`${player.firstName} ${player.lastName}`}
      onError={() => setFailed(true)}
    />
  );
};

export const GoldPlayerCard = ({
  player,
  large = false,
  className = ''
}: {
  player: Player;
  large?: boolean;
  className?: string;
}) => {
  const { cardDesign, siteDesign } = useCardDesign();
  const isClassicTheme = siteDesign === 'classic';
  const isGold = !isClassicTheme && cardDesign === 'gold';
  const teamColor = player.team?.primaryColor || '#f97316';
  const imageTransform = `translate(${player.cardImageX ?? 0}%, ${player.cardImageY ?? 0}%) scale(${player.cardImageScale ?? 1})`;

  if (isClassicTheme) {
    return (
      <div
        className={`relative mx-auto aspect-[3/4] w-full min-w-0 overflow-hidden rounded-[1.35rem] border-2 border-[#504d43] bg-[#ebe4d4] p-[5%] text-[#2d2c27] shadow-[0_10px_26px_rgba(0,0,0,0.16)] ${large ? 'max-w-[420px]' : 'max-w-none md:max-w-[320px]'} ${className}`}
      >
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'radial-gradient(rgba(45,44,39,0.13) 1px, transparent 1px), linear-gradient(135deg, transparent 22%, rgba(80,77,67,0.10) 22.5%, transparent 24%)',
            backgroundSize: '7px 7px, auto'
          }}
        />
        <div className="absolute inset-[3%] rounded-[1rem] border border-[#504d43]/70" />
        <div className="relative z-10 grid h-full grid-rows-[1fr_auto_auto] gap-[4%]">
          <div className="grid min-h-0 grid-cols-[1.05fr_0.95fr] gap-[4%]">
            <div className="relative min-h-0 border-2 border-[#504d43] bg-[#d8d2c3]">
              <div className="absolute left-[6%] top-[5%] z-20 grid h-[15%] w-[18%] place-items-center rounded-full border border-[#504d43] bg-[#ebe4d4] text-[0.7rem] font-black">
                ⚽
              </div>
              <PlayerCardImage
                player={player}
                className="h-full w-full object-cover object-top drop-shadow-xl"
                style={{ transform: imageTransform }}
              />
            </div>

            <div className="min-w-0 text-center">
              <div className="mb-[8%] flex items-center gap-2 text-[#504d43]">
                <div className="h-px flex-1 bg-[#504d43]" />
                <span className="text-[0.58rem] font-black uppercase tracking-[0.14em]">★ Duel Liga ★</span>
                <div className="h-px flex-1 bg-[#504d43]" />
              </div>
              <h3 className="truncate font-black uppercase leading-none text-[#2d2c27] text-[1.28rem] sm:text-[1.7rem] lg:text-[2rem]">{player.firstName}</h3>
              <h3 className="truncate font-black uppercase leading-none text-[#2d2c27] text-[1.28rem] sm:text-[1.7rem] lg:text-[2rem]">{player.lastName}</h3>
              <div className="my-[8%] border-y border-[#504d43] py-[5%]">
                <p className="text-[0.7rem] font-black text-[#504d43]">#</p>
                <p className="text-[2rem] font-black leading-none text-[#8f332d] sm:text-[2.45rem]">{player.shirtNumber}</p>
              </div>
              <p className="mx-auto max-w-full bg-[#504d43] px-2 py-1 text-[0.52rem] font-black uppercase tracking-[0.12em] text-[#ebe4d4] sm:text-[0.62rem]">{player.position}</p>
              <div className="mt-[10%] border-t border-[#504d43] pt-[7%]">
                <p className="truncate text-[1.15rem] font-black uppercase leading-none sm:text-[1.45rem]">{player.team?.shortName || 'TEAM'}</p>
                <p className="mt-1 text-[0.58rem] font-black uppercase tracking-[0.22em] text-[#504d43]">F.C.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 border-y border-[#504d43] text-center">
            {[
              ['Ocjena', player.overallRating],
              ['Golovi', player.goals],
              ['Asist', player.assists]
            ].map(([label, value]) => (
              <div key={label} className="border-r border-[#504d43] px-1 py-2 last:border-r-0">
                <p className="text-[0.45rem] font-black uppercase tracking-[0.12em] text-[#504d43] sm:text-[0.55rem]">{label}</p>
                <p className="mt-1 text-[0.9rem] font-black text-[#8f332d] sm:text-[1.1rem]">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-[4%]">
            <div>
              <div className="mb-1 flex items-center gap-2 text-[#504d43]">
                <span className="text-[0.6rem]">★</span>
                <p className="text-[0.55rem] font-black uppercase tracking-[0.14em] sm:text-[0.62rem]">Statistika</p>
              </div>
              <div className="space-y-0.5">
                {ratingKeys.slice(0, 3).map((key) => (
                  <div key={key} className="flex items-center justify-between gap-2 text-[0.52rem] font-black uppercase sm:text-[0.62rem]">
                    <span>{key}</span>
                    <span className="text-[#8f332d]">{player[key]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center gap-2 text-[#504d43]">
                <span className="text-[0.6rem]">★</span>
                <p className="text-[0.55rem] font-black uppercase tracking-[0.14em] sm:text-[0.62rem]">Osobine</p>
              </div>
              <div className="space-y-0.5">
                {ratingKeys.slice(3).map((key) => (
                  <div key={key} className="flex items-center justify-between gap-2 text-[0.52rem] font-black uppercase sm:text-[0.62rem]">
                    <span>{key}</span>
                    <span className="text-[#8f332d]">{player[key]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isGold) {
    return (
      <div
        className={`group relative mx-auto aspect-[3/4] w-full min-w-0 overflow-hidden rounded-2xl border border-emerald-200/25 bg-[#071d18] shadow-2xl shadow-black/45 ${large ? 'max-w-[420px]' : 'max-w-none md:max-w-[320px]'} ${className}`}
      >
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background:
              `radial-gradient(circle at 50% 18%, ${teamColor}5c, transparent 31%), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,.055) 1px, transparent 1px)`,
            backgroundSize: 'auto, 18px 18px, 18px 18px'
          }}
        />
        <div className="absolute inset-x-[7%] top-2 z-20 flex items-start justify-between gap-2">
          <div>
            <p className="font-black leading-none text-white text-[1.7rem] sm:text-[2rem] lg:text-[2.45rem]">{player.overallRating}</p>
            <p className="mt-1 max-w-[4.5rem] truncate font-black uppercase tracking-[0.12em] text-emerald-100 text-[0.48rem] sm:text-[0.56rem] lg:text-[0.68rem]">{player.position}</p>
          </div>
          <div className="min-w-0 text-right">
            <p className="truncate font-black uppercase tracking-[0.16em] text-orange-200 text-[0.58rem] sm:text-[0.68rem] lg:text-[0.8rem]">{player.team?.shortName || 'TEAM'}</p>
            <div className="ml-auto mt-1 h-1.5 w-12 rounded-full" style={{ backgroundColor: teamColor }} />
          </div>
        </div>

        <div className="absolute left-1/2 top-2 z-10 h-[56%] w-[56%] -translate-x-1/2 overflow-visible pt-2 sm:h-[57%] sm:w-[58%]">
          <PlayerCardImage
            player={player}
            className="h-full w-full object-contain object-top drop-shadow-2xl"
            style={{ transform: imageTransform }}
            compact
          />
        </div>

        <div className="absolute inset-x-[7%] bottom-[26%] z-20">
          <p className="truncate font-black uppercase leading-none tracking-[0.08em] text-emerald-100 text-[0.68rem] sm:text-[0.82rem] lg:text-[0.95rem]">{player.firstName}</p>
          <h3 className="mt-1 truncate font-black uppercase leading-none text-white text-[1.05rem] sm:text-[1.28rem] lg:text-[1.55rem]">{player.lastName}</h3>
        </div>

        <div className="absolute inset-x-[7%] bottom-[7%] z-20 grid grid-cols-3 gap-x-2 gap-y-1.5">
          {ratingKeys.map((key) => (
            <div key={key} className="rounded border border-white/10 bg-white/[0.06] px-1 py-1 text-center">
              <p className="font-black leading-none text-white text-[0.62rem] sm:text-[0.76rem] lg:text-[0.9rem]">{player[key]}</p>
              <p className="mt-0.5 font-black uppercase leading-none tracking-[0.1em] text-emerald-100 text-[0.36rem] sm:text-[0.42rem] lg:text-[0.5rem]">{key}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative mx-auto aspect-[3/4] w-full min-w-0 overflow-hidden rounded-2xl border border-yellow-100/45 shadow-2xl shadow-black/45 ${large ? 'max-w-[420px]' : 'max-w-none md:max-w-[320px]'} ${className}`}
      style={{
        background: 'linear-gradient(135deg, #f8df82, #d69d26 45%, #fff0a8 70%, #c98212)'
      }}
    >
    <div
      className="absolute inset-0 opacity-70"
      style={{
        background:
          'linear-gradient(150deg, transparent 20%, rgba(255,255,255,.35) 21%, transparent 35%), linear-gradient(130deg, transparent 35%, rgba(255,255,255,.25) 36%, transparent 50%), radial-gradient(circle at 20% 20%, rgba(255,255,255,.35), transparent 25%)'
      }}
    />
    <div
      className="absolute -left-[18%] top-[32%] h-[13%] w-[140%] rotate-[-35deg] shadow-[0_0_20px_rgba(255,255,255,.35)]"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.55), #d36300, #9b3f00, rgba(255,255,255,.45), transparent)'
      }}
    >
      <div className="absolute left-0 top-[33%] h-[10%] w-full bg-[#ffee9f]/90" />
    </div>
    <div className="absolute left-0 right-0 top-[56%] h-[18%] border-y border-white/20 bg-[#ffe891]/22" />
    <div
      className="absolute bottom-[17%] right-[12%] h-[36%] w-[50%] skew-y-[-12deg] opacity-45"
      style={{ backgroundImage: 'radial-gradient(rgba(150, 105, 20, .35) 2px, transparent 2px)', backgroundSize: '16px 16px' }}
    />

    <div className="absolute left-[7%] top-[6%] z-20 max-w-[28%] text-center text-[#1f2937] drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">
      <p className="font-black leading-none text-[1.28rem] sm:text-[1.55rem] lg:text-[2rem]">{player.overallRating}</p>
      <p className="mt-0.5 truncate font-black uppercase leading-tight text-[0.42rem] sm:text-[0.52rem] lg:text-[0.62rem]">{player.position}</p>
      <p className="mt-0.5 truncate font-black uppercase text-[0.48rem] sm:text-[0.58rem] lg:text-[0.68rem]">{player.team?.shortName}</p>
    </div>

    <PlayerCardImage
      player={player}
      className="absolute left-1/2 top-2 z-10 h-[53%] w-[58%] -translate-x-1/2 object-contain object-top drop-shadow-2xl sm:h-[55%] sm:w-[60%]"
      style={{ transform: `translateX(-50%) ${imageTransform}` }}
      compact
    />

    <div className="absolute bottom-[24%] left-1/2 z-20 w-[86%] -translate-x-1/2 text-center text-[#1f2937] drop-shadow-[0_1px_1px_rgba(255,255,255,0.65)]">
      <p className="truncate font-black uppercase leading-tight text-[0.78rem] sm:text-[0.95rem] lg:text-[1.1rem]">{player.firstName}</p>
      <h3 className="truncate font-black uppercase leading-tight text-[0.92rem] sm:text-[1.08rem] lg:text-[1.35rem]">{player.lastName}</h3>
    </div>

    <div className="absolute bottom-[7%] left-1/2 z-20 grid w-[86%] -translate-x-1/2 grid-cols-3 gap-x-[4%] gap-y-1 text-[#1f2937] drop-shadow-[0_1px_1px_rgba(255,255,255,0.55)]">
      {ratingKeys.map((key) => (
        <div key={key} className="flex items-center justify-center gap-0.5">
          <span className="font-black text-[0.52rem] sm:text-[0.68rem] lg:text-[0.82rem]">{player[key]}</span>
          <span className="font-black uppercase text-[0.34rem] sm:text-[0.44rem] lg:text-[0.54rem]">{key}</span>
        </div>
      ))}
    </div>
  </div>
  );
};
