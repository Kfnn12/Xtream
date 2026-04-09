import React, { useState, useEffect } from 'react';
import AnimeCard from '../components/AnimeCard';
import { fetchFromApi, normalizeAnime } from '../api/kaido';

export default function SearchView({ query, onAnimeSelect, onBack }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function searchData() {
      setLoading(true);
      try {
        const raw = await fetchFromApi(`/api/kaido/search?keyword=${encodeURIComponent(query)}`);
        const items = raw.animes || raw.results || raw.data?.animes || [];
        setResults(items.map(normalizeAnime));
      } catch (err) {
        setResults([]);
      }
      setLoading(false);
    }
    searchData();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <button onClick={onBack} className="text-blue-400 mb-8 flex items-center gap-2 hover:text-blue-300 font-medium">
        <i className="fa-solid fa-arrow-left"></i> Back to Home
      </button>
      
      <h1 className="text-3xl sm:text-4xl font-black mb-8">Results for "{query}"</h1>
      
      {loading ? (
        <div className="text-center py-20 text-gray-400">
          <i className="fa-solid fa-circle-notch fa-spin text-3xl mb-4"></i>
          <p>Searching...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {results.map(anime => (
            <AnimeCard key={anime.id} anime={anime} onClick={onAnimeSelect} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500 font-medium text-lg">
          No results found. Try another term.
        </div>
      )}
    </div>
  );
}
