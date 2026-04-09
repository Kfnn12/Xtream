export const BASE_API_URL = 'https://ogkgn.vercel.app';
export const M3U8_PROXIES = [
  'https://proxy1-delta-lake.vercel.app/m3u8-proxy?url=',
  'https://hianimeproxy-olive.vercel.app/m3u8?url=',
  'https://animepahe-proxy.vercel.app/m3u8-proxy?url=',
  '' // Fallback to direct connection if proxies fail
];

export async function fetchFromApi(path) {
  const res = await fetch(BASE_API_URL + path);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return await res.json();
}

export function normalizeAnime(a) {
  return {
    id: a.id,
    name: a.name || a.title || "Unknown Title",
    jname: a.romaji || a.japanese || a.name,
    poster: a.posterImage || a.poster || a.image || "",
    rating: a.rating || a.score || "N/A",
    type: a.type || 'TV',
    episodes: a.episodes || a.episode || a.latestEpisode || null,
    description: a.synopsis || a.description || ''
  };
}
