import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeView from './views/HomeView';
import DetailsView from './views/DetailsView';
import WatchView from './views/WatchView';
import SearchView from './views/SearchView';
import { fetchFromApi } from './api/kaido';

export default function App() {
  const [view, setView] = useState('home'); // 'home', 'details', 'watch', 'search'
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [currentEpisodeId, setCurrentEpisodeId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const navigateTo = (newView) => {
    setView(newView);
    window.scrollTo(0, 0);
  };

  const handleAnimeSelect = async (id) => {
    try {
      const raw = await fetchFromApi(`/api/kaido/anime/${id}`);
      const data = raw.data || raw;
      data.providerEpisodes = raw.providerEpisodes || raw.episodes || [];
      setSelectedAnime(data);
      navigateTo('details');
    } catch (err) {
      alert("Failed to load anime details.");
    }
  };

  const handleWatch = (episodeId) => {
    setCurrentEpisodeId(episodeId);
    navigateTo('watch');
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    navigateTo('search');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onHome={() => navigateTo('home')} onSearch={handleSearch} />
      
      <main className="flex-grow pt-20 pb-12">
        {view === 'home' && <HomeView onAnimeSelect={handleAnimeSelect} />}
        
        {view === 'search' && (
          <SearchView query={searchQuery} onAnimeSelect={handleAnimeSelect} onBack={() => navigateTo('home')} />
        )}

        {view === 'details' && selectedAnime && (
          <DetailsView 
            anime={selectedAnime} 
            onBack={() => navigateTo('home')}
            onWatch={handleWatch} 
          />
        )}
        
        {/* Update this specific block in App.jsx */}
        {view === 'watch' && selectedAnime && currentEpisodeId && (
          <WatchView 
            anime={selectedAnime} 
            episodeId={currentEpisodeId} 
            onBack={() => navigateTo('details')} 
            onAnimeSelect={handleAnimeSelect}
            onWatch={handleWatch} /
          />
        )}
