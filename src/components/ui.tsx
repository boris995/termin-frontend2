import { forwardRef, ReactNode } from 'react';
import { useCardDesign } from './CardDesignProvider';

export const Panel = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  const { siteDesign } = useCardDesign();
  const premium = siteDesign === 'premium';
  return (
    <section className={`${premium ? 'rounded-md border border-white/10 bg-[#10131b] p-5 shadow-2xl shadow-black/30' : 'classic-panel border-2 border-[#504d43] bg-[#ebe4d4] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.12)]'} ${className}`}>
      {children}
    </section>
  );
};

export const PageTitle = ({ eyebrow, title }: { eyebrow: string; title: string }) => {
  const { siteDesign } = useCardDesign();
  const premium = siteDesign === 'premium';
  return (
    <div className="mb-6">
      <p className={`text-xs font-bold uppercase tracking-[0.22em] ${premium ? 'text-emerald-400' : 'text-[#8f332d]'}`}>{eyebrow}</p>
      <h2 className={`mt-2 font-black tracking-normal ${premium ? 'text-4xl uppercase leading-none text-white md:text-5xl' : 'text-3xl uppercase text-[#2d2c27] md:text-4xl'}`}>{title}</h2>
    </div>
  );
};

export const ErrorPanel = ({ message }: { message: string }) => (
  <Panel className="border-red-500/30 bg-red-950/40">
    <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">API greska</p>
    <p className="mt-2 break-words text-sm font-bold text-red-100">{message}</p>
  </Panel>
);

export const StatPill = ({ label, value }: { label: string | number; value: string | number }) => {
  const { siteDesign } = useCardDesign();
  const premium = siteDesign === 'premium';
  return (
    <div className={`rounded border px-4 py-3 ${premium ? 'border-white/10 bg-[#0b0f17]' : 'border-[#504d43] bg-[#e7dfce]'}`}>
      <p className={`text-xs uppercase tracking-widest ${premium ? 'text-slate-400' : 'text-[#504d43]'}`}>{label}</p>
      <p className={`mt-1 text-2xl font-black ${premium ? 'text-emerald-400' : 'text-[#8f332d]'}`}>{value}</p>
    </div>
  );
};

export const Button = ({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { siteDesign } = useCardDesign();
  const premium = siteDesign === 'premium';
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
        premium ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300' : 'border-2 border-[#504d43] bg-[#e7dfce] text-[#2d2c27] hover:bg-[#504d43] hover:text-[#ebe4d4]'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className = '', ...props }, ref) => {
  const { siteDesign } = useCardDesign();
  const premium = siteDesign === 'premium';
  return (
    <input
      ref={ref}
      className={`w-full rounded border border-white/10 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 ${
        premium ? 'bg-[#0b0f17] focus:border-emerald-400' : 'border-[#504d43] bg-[#f4eddd] text-[#2d2c27] focus:border-[#8f332d] placeholder:text-[#7a7466]'
      } ${className}`}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className = '', ...props }, ref) => {
  const { siteDesign } = useCardDesign();
  const premium = siteDesign === 'premium';
  return (
    <select
      ref={ref}
      className={`w-full rounded border border-white/10 px-3 py-2 text-sm text-white outline-none transition ${
        premium ? 'bg-[#0b0f17] focus:border-emerald-400' : 'border-[#504d43] bg-[#f4eddd] text-[#2d2c27] focus:border-[#8f332d]'
      } ${className}`}
      {...props}
    />
  );
});

Select.displayName = 'Select';
