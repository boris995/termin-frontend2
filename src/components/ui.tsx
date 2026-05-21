import { forwardRef, ReactNode } from 'react';

export const Panel = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <section className={`glass rounded-lg p-5 shadow-2xl shadow-black/20 ${className}`}>{children}</section>
);

export const PageTitle = ({ eyebrow, title }: { eyebrow: string; title: string }) => (
  <div className="mb-6">
    <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-300">{eyebrow}</p>
    <h2 className="mt-2 text-3xl font-black tracking-normal text-white md:text-4xl">{title}</h2>
  </div>
);

export const ErrorPanel = ({ message }: { message: string }) => (
  <Panel className="border-red-500/30 bg-red-950/40">
    <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">API greska</p>
    <p className="mt-2 break-words text-sm font-bold text-red-100">{message}</p>
  </Panel>
);

export const StatPill = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded border border-white/10 bg-slate-950/60 px-4 py-3">
    <p className="text-xs uppercase tracking-widest text-slate-400">{label}</p>
    <p className="mt-1 text-2xl font-black text-white">{value}</p>
  </div>
);

export const Button = ({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded bg-orange-500 px-4 py-2 text-sm font-black text-blue-950 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className = '', ...props }, ref) => (
  <input
    ref={ref}
    className={`w-full rounded border border-white/10 bg-blue-950/80 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400 ${className}`}
    {...props}
  />
));

Input.displayName = 'Input';

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className = '', ...props }, ref) => (
  <select
    ref={ref}
    className={`w-full rounded border border-white/10 bg-blue-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-orange-400 ${className}`}
    {...props}
  />
));

Select.displayName = 'Select';
