import React, { useState, useEffect } from 'react';
import AnimeCard from '../components/AnimeCard';
import { fetchFromApi, normalizeAnime } from '../api/kaido';

export default function HomeView({ onAnimeSelect }) {
  const [homeData, setHomeData] = useState(null);
  const [spotlightIdx, setSpotlightIdx] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const raw = await fetchFromApi('/api/kaido/home');
        setHomeData({
          spotlight: (raw.data || raw.spotlight || []).map(normalizeAnime),
          sections: [
            { title: "Trending Now", items: (raw.trending || []).map(normalizeAnime), icon: "🔥" },
            { title: "Latest Episodes", items: (raw.recentlyUpdated || raw.latestEpisodes || []).map(normalizeAnime), icon: "⏱️" },
            { title: "Top Airing", items: (raw.topAiring || []).map(normalizeAnime), icon: "📺" },
            { title: "Most Popular", items: (raw.mostPopular || []).map(normalizeAnime), icon: "⭐" }
          ]
        });
      } catch (err) {
        console.error("Home load failed", err);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!homeData?.spotlight?.length) return;
    const interval = setInterval(() => {
      setSpotlightIdx(prev => (prev + 1) % homeData.spotlight.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [homeData]);

  if (!homeData) return <div className="py-32 flex flex-col items-center justify-center text-gray-500"><i className="fa-solid fa-circle-notch fa-spin text-4xl mb-4"></i><p>Loading VidStream...</p></div>;

  const spotlight = homeData.spotlight[spotlightIdx];

  return (
    <div>
      {spotlight && (
        <div className="h-[85vh] relative overflow-hidden">
          <img src={spotlight.poster} className="w-full h-full object-cover" alt="Spotlight" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          
          <div className="absolute bottom-[15%] left-[5%] max-w-[650px] z-10 px-4">
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full mb-4">Spotlight</div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 leading-none">{spotlight.name}</h1>
            <p className="text-gray-300 text-lg line-clamp-3 mb-8">{spotlight.description}</p>
            <button onClick={() => onAnimeSelect(spotlight.id)} className="bg-white text-black px-10 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 hover:bg-gray-200 transition">
              <i className="fa-solid fa-play"></i> Watch Now
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12">
        {homeData.sections.map((sec, idx) => (
          sec.items.length > 0 && (
            <div key={idx} className="mb-16">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                <span>{sec.icon}</span> {sec.title}
              </h2>
              <div className="flex gap-5 overflow-x-auto pb-5 scrollbar-hide">
                {sec.items.map(anime => (
                  <div key={anime.id} className="min-w-[150px] sm:min-w-[180px]">
                    <AnimeCard anime={anime} onClick={onAnimeSelect} />
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
