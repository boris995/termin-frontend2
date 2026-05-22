import { ClipboardList, RefreshCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api, asArray, getApiErrorMessage, unwrap } from '../api/client';
import { Button, ErrorPanel, PageTitle, Panel } from '../components/ui';
import { AuditLog } from '../types';
import { formatDateTime } from '../utils/date';

const actionLabels: Record<AuditLog['action'], string> = {
  create: 'Kreirano',
  update: 'Izmijenjeno',
  delete: 'Obrisano',
  start: 'Pokrenuto',
  finish: 'Zavrseno',
  settings: 'Postavke'
};

const actionStyles: Record<AuditLog['action'], string> = {
  create: 'bg-emerald-400 text-slate-950',
  update: 'bg-orange-500 text-blue-950',
  delete: 'bg-red-500 text-white',
  start: 'bg-sky-400 text-slate-950',
  finish: 'bg-violet-400 text-slate-950',
  settings: 'bg-white/15 text-white'
};

export const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get('/audit-logs').then(unwrap<AuditLog[]>);
      setLogs(asArray(data));
      setError('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Audit log nije dostupan.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const grouped = useMemo(() => {
    return logs.reduce<Record<string, AuditLog[]>>((acc, log) => {
      const day = new Date(log.createdAt).toLocaleDateString('sr-Latn-BA');
      acc[day] = [...(acc[day] || []), log];
      return acc;
    }, {});
  }, [logs]);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageTitle eyebrow="Admin sigurnost" title="Audit log" />
        <Button type="button" onClick={load} disabled={loading}>
          <RefreshCcw size={17} />
          {loading ? 'Ucitavam...' : 'Osvjezi'}
        </Button>
      </div>
      {error && <div className="mb-5"><ErrorPanel message={error} /></div>}
      {!logs.length && !error && <Panel>Nema zabiljezenih admin akcija.</Panel>}
      <div className="space-y-5">
        {Object.entries(grouped).map(([day, items]) => (
          <Panel key={day} className="p-4">
            <div className="mb-4 flex items-center gap-2 text-orange-300">
              <ClipboardList size={20} />
              <h2 className="font-black">{day}</h2>
            </div>
            <div className="space-y-3">
              {items.map((log) => (
                <div key={log.id} className="grid gap-3 rounded border border-white/10 bg-slate-950/40 p-3 md:grid-cols-[140px_1fr_auto] md:items-center">
                  <div>
                    <span className={`inline-flex rounded px-2 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] ${actionStyles[log.action]}`}>
                      {actionLabels[log.action]}
                    </span>
                    <p className="mt-2 text-xs font-bold text-slate-400">{formatDateTime(log.createdAt)}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-white">{log.label || log.entityType}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {log.entityType}
                      {log.entityId ? ` #${log.entityId}` : ''}
                      {log.userEmail ? ` | ${log.userEmail}` : ''}
                    </p>
                  </div>
                  {log.metadata && (
                    <pre className="max-h-24 overflow-auto rounded bg-black/30 p-2 text-[0.68rem] text-slate-300 md:max-w-xs">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
};
