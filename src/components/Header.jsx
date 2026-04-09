import React, { useState } from 'react';

export default function Header({ onHome, onSearch }) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      onSearch(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10 py-4 transition-all duration-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <div onClick={onHome} className="flex items-center gap-2 text-2xl sm:text-3xl font-black text-blue-500 cursor-pointer">
          <i className="fa-solid fa-bolt"></i>
          <span className="tracking-tighter hidden md:block">VidStream</span>
        </div>

        <div className="flex-1 max-w-2xl mx-4 sm:mx-8">
          <div className="relative w-full">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search anime..." 
              className="w-full bg-zinc-900 border border-zinc-700 rounded-full py-2.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base text-white"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"></i>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2 rounded-full transition hidden lg:flex">
            <i className="fa-solid fa-download"></i> App
          </button>
          <div className="text-[10px] sm:text-xs font-bold bg-emerald-500/10 text-emerald-400 px-3 sm:px-4 py-2 rounded-full border border-emerald-500/30 whitespace-nowrap">
            AD-FREE
          </div>
        </div>
      </div>
    </header>
  );
}
