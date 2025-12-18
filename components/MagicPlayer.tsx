
import React, { useRef, useState, useEffect } from 'react';
import { MagicMoment } from '../types';

interface MagicPlayerProps {
  videoUrl: string;
  moment: MagicMoment;
}

const MagicPlayer: React.FC<MagicPlayerProps> = ({ videoUrl, moment }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        audioRef.current?.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        audioRef.current?.pause();
        setIsPlaying(false);
      }
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.currentTime >= moment.end || video.currentTime < moment.start) {
        video.currentTime = moment.start;
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.currentTime = moment.start;

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [moment]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.08;
    }
  }, []);

  return (
    <div className="relative group max-w-4xl mx-auto">
      <audio 
        ref={audioRef} 
        loop 
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
        className="hidden"
      />

      <div className="relative p-[10px] bg-yellow-500 rounded-xl gold-border overflow-hidden transition-all duration-700">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-auto rounded shadow-2xl bg-black"
          onClick={togglePlay}
        />
        
        <div className="absolute top-10 left-0 right-0 text-center pointer-events-none px-4">
          <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] sparkle-effect italic uppercase tracking-tighter">
            ✨ 精彩高光 ✨
          </h2>
          <p className="text-yellow-300 font-bold mt-2 text-lg md:text-xl drop-shadow-md">
            {moment.summary}
          </p>
        </div>

        <div className="absolute bottom-12 left-0 right-0 text-center pointer-events-none px-6">
          <div className="inline-block bg-black/70 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-2xl">
            <p className="text-white text-lg md:text-2xl font-semibold leading-tight tracking-wide">
              {moment.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <button 
          onClick={togglePlay}
          className="pointer-events-auto bg-yellow-500/90 p-6 rounded-full text-black transform hover:scale-110 transition-all shadow-2xl"
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
              <path d="M6 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5zm4 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
              <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default MagicPlayer;
