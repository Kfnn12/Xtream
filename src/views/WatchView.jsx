import React, { useState, useEffect } from 'react';
import VideoPlayer from '../components/VideoPlayer';
import AnimeCard from '../components/AnimeCard';
import { fetchFromApi, normalizeAnime } from '../api/kaido';

export default function WatchView({ anime, episodeId, onBack, onAnimeSelect }) {
  const [streamData, setStreamData] = useState({ url: null, tracks: [] });
  const [loading, setLoading] = useState(true);

  const episodeIndex = anime.providerEpisodes?.findIndex(ep => String(ep.id || ep.episodeId || ep.number) === String(episodeId));
  const currentEp = anime.providerEpisodes?.[episodeIndex];

  useEffect(() => {
    async function loadStream() {
      setLoading(true);
      try {
        const raw = await fetchFromApi(`/api/kaido/watch/${encodeURIComponent(episodeId)}`);
        setStreamData({
          url: raw.data?.sources?.[0]?.url || raw.sources?.[0]?.url || raw.url,
          tracks: raw.data?.subtitles || raw.data?.tracks || raw.subtitles || []
        });
      } catch (err) {
        console.error("Stream failed", err);
      }
      setLoading(false);
    }
    loadStream();
  }, [episodeId]);

  const related = (anime.recommendedAnimes || anime.relatedAnimes || anime.related || []).map(normalizeAnime);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition">
          <i className="fa-solid fa-arrow-left"></i> Back to Details
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold truncate">Episode {currentEp?.number || '?'} - {anime.name}</h2>
      </div>

      <div className="mb-12">
        {loading ? (
          <div className="w-full aspect-video bg-zinc-900 animate-pulse rounded-xl flex flex-col items-center justify-center text-gray-500 shadow-2xl">
            <i className="fa-solid fa-circle-notch fa-spin text-3xl mb-3"></i>
            <p>Fetching Stream Details...</p>
          </div>
        ) : streamData.url ? (
          <VideoPlayer streamUrl={streamData.url} tracks={streamData.tracks} />
        ) : (
          <div className="w-full aspect-video bg-zinc-900 rounded-xl flex items-center justify-center text-red-400 border border-red-900 shadow-2xl">
            Stream not available. Please try another episode or server.
          </div>
        )}
      </div>

      {related.length > 0 && (
        <div className="mt-12 pt-8 border-t border-zinc-900">
          <h3 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2">
            <i className="fa-solid fa-layer-group text-blue-500"></i> Similar Anime
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {related.slice(0, 12).map(sim => (
              <AnimeCard key={sim.id} anime={sim} onClick={onAnimeSelect} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
