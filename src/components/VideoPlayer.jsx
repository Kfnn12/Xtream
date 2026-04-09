import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { M3U8_PROXIES } from '../api/kaido';

export default function VideoPlayer({ streamUrl, tracks }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [proxyIndex, setProxyIndex] = useState(0);
  const [isSwitching, setIsSwitching] = useState(false);

  const switchProxy = () => {
    setIsSwitching(true);
    setProxyIndex(prev => (prev + 1) % M3U8_PROXIES.length);
    setTimeout(() => setIsSwitching(false), 800);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    const currentProxy = M3U8_PROXIES[proxyIndex];
    // If currentProxy is an empty string, do a direct connection. Otherwise, append proxy query.
    const finalUrl = currentProxy 
      ? `${currentProxy}${encodeURIComponent(streamUrl)}&t=${Date.now()}` 
      : streamUrl;

    if (Hls.isSupported()) {
      const hls = new Hls({ manifestLoadingMaxRetry: 5, levelLoadingMaxRetry: 5 });
      hlsRef.current = hls;

      hls.loadSource(finalUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => console.log("Auto-play prevented by browser policy:", e));
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal && (data.details === 'manifestLoadError' || data.type === Hls.ErrorTypes.NETWORK_ERROR)) {
          console.warn("HLS Error encountered, attempting to switch node...");
          switchProxy();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari fallback
      video.src = finalUrl;
      video.addEventListener('loadedmetadata', () => video.play());
    }

    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [streamUrl, proxyIndex]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.parentElement?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="w-full">
      <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl group">
        <video ref={videoRef} controls crossOrigin="anonymous" className="w-full aspect-video" playsInline>
          {tracks?.map((track, idx) => (
            track.kind !== 'thumbnails' && track.file && (
              <track
                key={idx}
                kind={track.kind || 'captions'}
                label={track.label || 'English'}
                srcLang={track.label?.substring(0, 2).toLowerCase() || 'en'}
                src={track.file}
                default={track.default || track.label?.toLowerCase().includes('english')}
              />
            )
          ))}
        </video>
      </div>
      <div className="mt-4 flex gap-4 justify-center">
        <button onClick={toggleFullScreen} className="bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-2xl font-medium transition text-sm flex items-center gap-2">
          <i className="fa-solid fa-expand"></i> Full Screen
        </button>
        <button 
          onClick={switchProxy} 
          disabled={isSwitching}
          className={`px-6 py-3 rounded-2xl font-medium transition text-sm flex items-center gap-2 ${isSwitching ? 'bg-blue-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700'}`}
        >
          <i className={`fa-solid ${isSwitching ? 'fa-spinner fa-spin' : 'fa-rotate'}`}></i> 
          {isSwitching ? 'Switching...' : 'Switch Node'}
        </button>
      </div>
    </div>
  );
}
