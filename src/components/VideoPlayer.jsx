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

  // 1. Handle Video Streaming (HLS or Native)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    const currentProxy = M3U8_PROXIES[proxyIndex];
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
      video.src = finalUrl;
      video.addEventListener('loadedmetadata', () => video.play());
    }

    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [streamUrl, proxyIndex]);

  // 2. Force Subtitles to Show
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !tracks || tracks.length === 0) return;

    const forceSubtitles = () => {
      const textTracks = video.textTracks;
      if (!textTracks) return;

      for (let i = 0; i < textTracks.length; i++) {
        const track = textTracks[i];
        const label = (track.label || '').toLowerCase();
        const lang = (track.language || '').toLowerCase();
        
        // Match English tracks
        if (label.includes('english') || label.includes('eng') || lang === 'en') {
          track.mode = 'showing';
        } else {
          track.mode = 'hidden'; // Hide other languages to prevent overlap
        }
      }
    };

    // Attach to multiple lifecycle events to bypass browser loading quirks
    video.addEventListener('loadedmetadata', forceSubtitles);
    video.addEventListener('canplay', forceSubtitles);
    
    // Fallback timeout for React rendering delays
    const timeout = setTimeout(forceSubtitles, 500);

    return () => {
      video.removeEventListener('loadedmetadata', forceSubtitles);
      video.removeEventListener('canplay', forceSubtitles);
      clearTimeout(timeout);
    };
  }, [streamUrl, tracks]);

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
          {tracks?.map((track, idx) => {
            // Support both API structures (file vs url)
            const trackUrl = track.file || track.url;
            if (track.kind === 'thumbnails' || !trackUrl) return null;

            return (
              <track
                key={`${trackUrl}-${idx}`}
                kind={track.kind || 'captions'}
                label={track.label || 'English'}
                srcLang={track.label?.substring(0, 2).toLowerCase() || 'en'}
                src={trackUrl}
                default={track.default || track.label?.toLowerCase().includes('english')}
              />
            );
          })}
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
}          disabled={isSwitching}
          className={`px-6 py-3 rounded-2xl font-medium transition text-sm flex items-center gap-2 ${isSwitching ? 'bg-blue-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700'}`}
        >
          <i className={`fa-solid ${isSwitching ? 'fa-spinner fa-spin' : 'fa-rotate'}`}></i> 
          {isSwitching ? 'Switching...' : 'Switch Node'}
        </button>
      </div>
    </div>
  );
}
