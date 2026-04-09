import React from 'react';

export default function DetailsView({ anime, onBack, onWatch }) {
  const episodes = anime.providerEpisodes || [];
  const totalEps = episodes.length || anime.totalEpisodes || "?";

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <button onClick={onBack} className="text-blue-400 mb-8 flex items-center gap-2 hover:text-blue-300 font-medium">
        <i className="fa-solid fa-arrow-left"></i> Back
      </button>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="lg:w-1/3">
          <img src={anime.posterImage || anime.poster} className="w-full rounded-3xl shadow-2xl object-cover aspect-[2/3]" alt="Poster" />
        </div>
        
        <div className="lg:w-2/3">
          <h1 className="text-4xl sm:text-5xl font-black mb-4">{anime.name || anime.title}</h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">{anime.synopsis || anime.description || "No description available."}</p>
          
          <div className="flex flex-wrap gap-4 mb-10">
            <span className="bg-zinc-800 text-gray-300 px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
              <i className="fa-solid fa-film text-xs"></i> {totalEps} Episodes
            </span>
            <span className="bg-blue-600/20 text-blue-400 px-4 py-1.5 rounded-full text-sm font-medium border border-blue-600/30">
              {anime.type || 'TV'}
            </span>
            <span className="bg-amber-500/20 text-amber-400 px-4 py-1.5 rounded-full text-sm font-medium border border-amber-500/30 flex items-center gap-2">
              <i className="fa-solid fa-star text-xs"></i> {anime.rating || anime.score || 'N/A'}
            </span>
          </div>

          <h3 className="text-2xl font-bold mb-6">Episodes</h3>
          {episodes.length === 0 ? (
            <div className="text-gray-500 p-4 bg-zinc-900 rounded-xl">No episodes available at the moment.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[520px] overflow-y-auto pr-4 scrollbar-hide">
              {episodes.map((ep, index) => {
                const epNum = ep.number || (index + 1);
                const epId = ep.id || ep.episodeId || epNum;
                return (
                  <button 
                    key={epId} 
                    onClick={() => onWatch(epId)}
                    className="relative bg-[#1f1f1f] hover:bg-blue-600 border border-[#333] hover:border-blue-600 p-3 sm:p-4 rounded-xl text-left transition-all duration-200 flex flex-col justify-center overflow-hidden group"
                  >
                    <div className="relative z-10 font-bold text-sm sm:text-base text-gray-200 group-hover:text-white">Episode {epNum}</div>
                    <div className="relative z-10 text-[10px] sm:text-xs text-gray-400 truncate w-full mt-1 group-hover:text-blue-100">{ep.title || `Ep ${epNum}`}</div>
                    <div className="absolute -bottom-2 -right-1 text-5xl font-black text-white/5 group-hover:text-white/20 transition pointer-events-none select-none">{epNum}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
