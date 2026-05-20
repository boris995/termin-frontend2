import { useEffect, useState } from 'react';
import { api, unwrap } from '../api/client';
import { fallbackSeason } from '../data/fallback';
import { Season } from '../types';

export const SeasonSelector = ({ value, onChange }: { value: number; onChange: (seasonId: number) => void }) => {
  const [seasons, setSeasons] = useState<Season[]>([fallbackSeason]);

  useEffect(() => {
    api.get('/seasons').then(unwrap<Season[]>).then((items) => items.length && setSeasons(items)).catch(() => undefined);
  }, []);

  return (
    <select
      className="rounded border border-white/10 bg-blue-950/80 px-3 py-2 text-sm text-white outline-none focus:border-orange-400"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    >
      {seasons.map((season) => (
        <option key={season.id} value={season.id}>
          {season.name}
        </option>
      ))}
    </select>
  );
};
