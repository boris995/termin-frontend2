const apiBase = import.meta.env.VITE_API_URL || '/api';
const backendOrigin = apiBase.replace(/\/api\/?$/, '');

export const assetUrl = (url?: string | null) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('/player-assets')) return url;
  if (url.startsWith('/uploads')) return `${backendOrigin}${url}`;
  return url;
};
