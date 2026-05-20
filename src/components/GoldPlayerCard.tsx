import { assetUrl } from '../api/assets';
import { Player } from '../types';

const ratingKeys = ['pac', 'sho', 'pas', 'dri', 'def', 'phy'] as const;

export const GoldPlayerCard = ({ player, large = false, className = '' }: { player: Player; large?: boolean; className?: string }) => (
  <div
    className={`group relative mx-auto aspect-[5/7] w-full min-w-[132px] overflow-hidden shadow-2xl shadow-black/45 ${large ? 'max-w-[373px]' : 'max-w-[280px]'} ${className}`}
    style={{
      clipPath: 'polygon(13% 10%, 22% 8%, 28% 0, 72% 0, 78% 8%, 87% 10%, 87% 88%, 50% 100%, 13% 88%)',
      borderRadius: '18px',
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
    <div className="absolute left-0 right-0 top-[52%] h-[20%] border-y border-white/25 bg-[#ffe891]/45" />
    <div
      className="absolute bottom-[17%] right-[12%] h-[36%] w-[50%] skew-y-[-12deg] opacity-45"
      style={{ backgroundImage: 'radial-gradient(rgba(150, 105, 20, .35) 2px, transparent 2px)', backgroundSize: '16px 16px' }}
    />

    <div className="absolute left-[13%] top-[12%] z-10">
      <p className="font-black leading-none text-[#1f2937] [font-size:clamp(1.8rem,9vw,3.75rem)]">{player.overallRating}</p>
      <p className="max-w-[5.7rem] font-black uppercase leading-tight text-[#1f2937] [font-size:clamp(.48rem,2vw,.75rem)]">{player.position}</p>
      <p className="mt-1 font-black uppercase text-[#1f2937] [font-size:clamp(.5rem,2vw,.75rem)]">{player.team?.shortName}</p>
    </div>

    <img
      className="absolute left-1/2 top-[18%] z-10 h-[49%] w-[74%] -translate-x-1/2 object-contain drop-shadow-2xl"
      src={assetUrl(player.cardImageUrl || '/player-assets/player-card.svg')}
      alt={`${player.firstName} ${player.lastName}`}
    />

    <div className="absolute bottom-[22%] left-1/2 z-20 w-[78%] -translate-x-1/2 text-center">
      <h3 className="truncate font-black uppercase tracking-normal text-[#1f2937] [font-size:clamp(.9rem,4.8vw,1.875rem)]">
        {player.lastName}
      </h3>
      <p className="truncate font-black text-[#3f2f10] [font-size:clamp(.55rem,2.6vw,.875rem)]">{player.firstName}{player.nickname ? ` "${player.nickname}"` : ''}</p>
    </div>

    <div className="absolute bottom-[10%] left-1/2 z-20 grid w-[78%] -translate-x-1/2 grid-cols-3 gap-x-[4%] gap-y-0.5">
      {ratingKeys.map((key) => (
        <div key={key} className="flex items-center justify-center gap-0.5 text-[#1f2937]">
          <span className="font-black [font-size:clamp(.62rem,2.8vw,1.125rem)]">{player[key]}</span>
          <span className="font-black uppercase [font-size:clamp(.42rem,1.8vw,.625rem)]">{key}</span>
        </div>
      ))}
    </div>

    <div className="absolute bottom-[4%] z-20 w-full text-center font-black leading-none tracking-[-1px] text-[#1f2937] [font-size:clamp(.55rem,2.9vw,1rem)]">
      GFP
      <span className="block font-bold tracking-normal [font-size:clamp(.38rem,1.8vw,.56rem)]">CARDS</span>
    </div>
  </div>
);
