import React, { useState, useEffect } from 'react';
import VideoPlayer from '../components/VideoPlayer';
import AnimeCard from '../components/AnimeCard';
import { fetchFromApi, normalizeAnime } from '../api/kaido';

export default function WatchView({ anime, episodeId, onBack, onAnimeSelect, onWatch }) {
  const [streamData, setStreamData] = useState({ url: null, tracks: [] });
  const [loading, setLoading] = useState(true);

  // Safely get episodes array
  const eps = anime.providerEpisodes || [];
  const currentEpIndex = eps.findIndex(ep => String(ep.id || ep.episodeId || ep.number) === String(episodeId));
  const currentEp = eps[currentEpIndex];

  // Determine if the API returned episodes in ascending or descending order
  let isDescending = false;
  if (eps.length > 1) {
    const firstNum = parseFloat(eps[0].number) || 0;
    const lastNum = parseFloat(eps[eps.length - 1].number) || eps.length;
    if (firstNum > lastNum) isDescending = true;
  }

  // Calculate Next and Previous indexes based on array order
  const prevIndex = isDescending ? currentEpIndex + 1 : currentEpIndex - 1;
  const nextIndex = isDescending ? currentEpIndex - 1 : currentEpIndex + 1;

  const prevEp = prevIndex >= 0 && prevIndex < eps.length ? eps[prevIndex] : null;
  const nextEp = nextIndex >= 0 && nextIndex < eps.length ? eps[nextIndex] : null;

  useEffect(() => {
    async function loadStream() {
      setLoading(true);
      let foundUrl = null;
      let foundTracks = [];

      const idString = String(episodeId);
      const separator = idString.includes('?') ? '&' : '?';
      const encodedId = encodeURIComponent(idString);

      const possibleEndpoints = [
        `/api/kaido/watch/${encodedId}`,
        `/api/kaido/episode/sources?animeEpisodeId=${encodedId}&category=sub`,
        `/api/kaido/sources/${idString}${separator}version=sub&server=vidcloud`,
        `/api/kaido/watch?episodeId=${encodedId}`
      ];

      for (const endpoint of possibleEndpoints) {
        try {
          const raw = await fetchFromApi(endpoint);
          const url = raw.data?.sources?.[0]?.url || raw.sources?.[0]?.url || raw.url;
          
          if (url) {
            foundUrl = url;
            foundTracks = raw.data?.subtitles || raw.data?.tracks || raw.subtitles || raw.tracks || [];
            break; 
          }
        } catch (err) {
          console.warn(`Fallback: Endpoint ${endpoint} failed, trying next...`);
        }
      }

      setStreamData({ url: foundUrl, tracks: foundTracks });
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

      <div className="mb-6">
        {loading ? (
          <div className="w-full aspect-video bg-zinc-900 animate-pulse rounded-xl flex flex-col items-center justify-center text-gray-500 shadow-2xl">
            <i className="fa-solid fa-circle-notch fa-spin text-3xl mb-3"></i>
            <p>Fetching Stream Details...</p>
          </div>
        ) : streamData.url ? (
          <VideoPlayer streamUrl={streamData.url} tracks={streamData.tracks} />
        ) : (
          <div className="w-full aspect-video bg-zinc-900 rounded-xl flex items-center justify-center text-red-400 border border-red-900 shadow-2xl">
            Stream not available. The server may be down or the episode ID is invalid.
          </div>
        )}
      </div>

      {/* Episode Navigation Controls */}
      <div className="flex justify-between items-center mb-12 border-b border-zinc-900 pb-8">
        {prevEp ? (
          <button 
            onClick={() => onWatch(prevEp.id || prevEp.episodeId || prevEp.number)} 
            className="bg-zinc-800 hover:bg-zinc-700 px-5 py-3 rounded-2xl font-medium transition text-sm sm:text-base flex items-center gap-3"
          >
            <i className="fa-solid fa-backward-step"></i> 
            <span><span className="hidden sm:inline">Previous </span>Ep {prevEp.number}</span>
          </button>
        ) : <div></div> /* Empty div to keep Next button pushed to the right */}

        {nextEp && (
          <button 
            onClick={() => onWatch(nextEp.id || nextEp.episodeId || nextEp.number)} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-medium transition text-sm sm:text-base flex items-center gap-3 shadow-lg shadow-blue-900/20"
          >
            <span><span className="hidden sm:inline">Next </span>Ep {nextEp.number}</span> 
            <i className="fa-solid fa-forward-step"></i>
          </button>
        )}
      </div>

      {related.length > 0 && (
        <div className="mt-8">
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
