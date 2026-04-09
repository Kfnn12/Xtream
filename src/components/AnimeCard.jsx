import React from 'react';

export default function AnimeCard({ anime, onClick }) {
  let epBadge = null;
  if (anime.episodes) {
    const epNum = typeof anime.episodes === 'object' ? (anime.episodes.sub || anime.episodes.dub) : anime.episodes;
    if (epNum) {
      epBadge = <div className="bg-zinc-900/90 text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded border border-zinc-700 shadow-lg mt-1">EP {epNum}</div>;
    }
  }

  return (
    <div className="transition-all duration-300 cursor-pointer hover:-translate-y-3 hover:scale-105 group" onClick={() => onClick(anime.id)}>
      <div className="relative rounded-2xl overflow-hidden shadow-xl bg-zinc-900 aspect-[2/3]">
        <img src={anime.poster} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" alt={anime.name} />
        <div className="absolute top-2 right-2 flex flex-col items-end">
          <div className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg">
            {anime.type}
          </div>
          {epBadge}
        </div>
      </div>
      <h3 className="mt-3 text-sm sm:text-base font-semibold line-clamp-2 text-gray-200">{anime.name}</h3>
    </div>
  );
}
