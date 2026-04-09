import React, { useState, useEffect } from 'react';
import AnimeCard from '../components/AnimeCard';
import { fetchFromApi, normalizeAnime } from '../api/kaido';

export default function SearchView({ query, onAnimeSelect, onBack }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function searchData() {
      if (!query) return;
      
      setLoading(true);
      let foundResults = [];

      // Array of endpoints to try in case the API routing changes
      const possibleEndpoints = [
        `/api/kaido/search?keyword=${encodeURIComponent(query)}`,
        `/api/kaido/anime/search?q=${encodeURIComponent(query)}`,
        `/api/kaido/search/${encodeURIComponent(query)}`,
        `/api/kaido/search?q=${encodeURIComponent(query)}`
      ];

      for (const endpoint of possibleEndpoints) {
        try {
          const raw = await fetchFromApi(endpoint);
          
          // Try to extract the array from various common API response shapes
          let items = raw.animes || raw.results || raw.data?.animes || raw.data?.results || raw.data || raw || [];
          
          // Deep fallback: If the API returns an object of objects, find the first array inside it
          if (!Array.isArray(items) && typeof items === 'object') {
             items = Object.values(items).find(Array.isArray) || [];
          }

          if (Array.isArray(items) && items.length > 0) {
            foundResults = items;
            break; // Stop looking once we find valid data
          }
        } catch (err) {
          console.warn(`Search Fallback: Endpoint ${endpoint} failed, trying next...`);
        }
      }

      setResults(foundResults.map(normalizeAnime));
      setLoading(false);
    }

    searchData();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <button onClick={onBack} className="text-blue-400 mb-8 flex items-center gap-2 hover:text-blue-300 font-medium transition">
        <i className="fa-solid fa-arrow-left"></i> Back to Home
      </button>
      
      <h1 className="text-3xl sm:text-4xl font-black mb-8">Results for "{query}"</h1>
      
      {loading ? (
        <div className="text-center py-20 text-gray-400">
          <i className="fa-solid fa-circle-notch fa-spin text-3xl mb-4"></i>
          <p>Searching the database...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {results.map(anime => (
            <AnimeCard key={anime.id} anime={anime} onClick={onAnimeSelect} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800">
          <i className="fa-solid fa-ghost text-4xl text-zinc-600 mb-4 block"></i>
          <p className="text-gray-400 font-medium text-lg">No results found for "{query}".</p>
          <p className="text-zinc-500 text-sm mt-2">Try using the Japanese (Romaji) title or checking your spelling.</p>
        </div>
      )}
    </div>
  );
}
