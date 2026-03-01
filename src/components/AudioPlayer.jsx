import { useMemo, useRef, useState } from "react";

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export default function AudioPlayer({ src }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const progress = useMemo(() => {
    if (!duration) {
      return 0;
    }
    return (currentTime / duration) * 100;
  }, [currentTime, duration]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || isLoading) {
      return;
    }

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  const handleSeek = (event) => {
    const audio = audioRef.current;
    if (!audio || !duration) {
      return;
    }

    const nextProgress = Number(event.target.value);
    const nextTime = (nextProgress / 100) * duration;
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleVolume = (event) => {
    const audio = audioRef.current;
    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);

    if (audio) {
      audio.volume = nextVolume;
    }
  };

  if (!src) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4 text-muted-foreground font-lora text-center">
        Audio unavailable for this story.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-3xl border border-border bg-background p-4 sm:p-6 shadow-md transition-all hover:shadow-xl group">
      
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-between">
        
        {/* Play Button & Time Block */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button
            type="button"
            onClick={togglePlay}
            disabled={isLoading}
            className="flex-shrink-0 h-14 w-14 rounded-full bg-primary flex items-center justify-center text-xl text-primary-foreground transition-transform hover:scale-105 hover:shadow-[0_0_15px_rgba(201,146,42,0.4)] disabled:cursor-not-allowed disabled:opacity-60 pl-1"
          >
            {playing ? <span className="-ml-1">⏸</span> : "▶"}
          </button>

          <div className="flex flex-col">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
              Narration Track
            </span>
            <div className="min-w-21 font-mono text-sm font-medium text-foreground bg-card px-3 py-1 rounded-md border border-border">
              {formatTime(currentTime)} <span className="text-muted-foreground">/</span> {formatTime(duration)}
            </div>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Vol</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolume}
            className="w-24 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>

      {/* Main Scrubber */}
      <div className="relative pt-2">
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          disabled={isLoading || !duration}
          className="w-full h-2 bg-card rounded-lg appearance-none cursor-pointer accent-primary disabled:cursor-not-allowed border border-border transition-all group-hover:h-3"
        />
        {isLoading && (
          <p className="absolute -top-4 right-0 text-xs text-primary animate-pulse font-bold">Loading track...</p>
        )}
      </div>

      <audio
        key={src}
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadStart={() => {
          setPlaying(false);
          setCurrentTime(0);
          setDuration(0);
          setIsLoading(true);
        }}
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration || 0);
          setIsLoading(false);
        }}
        onCanPlay={() => setIsLoading(false)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime || 0)}
        onEnded={() => {
          setPlaying(false);
          setCurrentTime(0);
        }}
      />
    </div>
  );
}
