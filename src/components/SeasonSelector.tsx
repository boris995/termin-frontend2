import { useEffect, useState } from 'react';
import { api, asArray, unwrap } from '../api/client';
import { Season } from '../types';

let seasonsCache: Season[] | null = null;
let seasonsRequest: Promise<Season[]> | null = null;

const loadSeasons = async () => {
  if (seasonsCache) return seasonsCache;
  if (!seasonsRequest) {
    seasonsRequest = api.get('/seasons').then(unwrap<Season[]>).then((items) => {
      seasonsCache = asArray(items);
      return seasonsCache;
    }).finally(() => {
      seasonsRequest = null;
    });
  }
  return seasonsRequest;
};

export const SeasonSelector = ({ value, onChange }: { value: number; onChange: (seasonId: number) => void }) => {
  const [seasons, setSeasons] = useState<Season[]>([]);

  useEffect(() => {
    loadSeasons().then(setSeasons).catch((error) => console.error('Sezone nisu ucitane:', error));
  }, []);

  return (
    <select
      className="rounded border border-white/10 bg-blue-950/80 px-3 py-2 text-sm text-white outline-none focus:border-orange-400"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    >
      {!seasons.length && <option value={value}>Nema sezona iz backend-a</option>}
      {seasons.map((season) => (
        <option key={season.id} value={season.id}>
          {season.name}
        </option>
      ))}
    </select>
  );
};
