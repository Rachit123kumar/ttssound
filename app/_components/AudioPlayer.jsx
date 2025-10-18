// components/AudioPlayer.jsx
'use client';
import { useAudio } from '../../context/AudioContext';

export default function AudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    playTrack,
    pauseTrack,
    seekTo,
  } = useAudio();

  if (!currentTrack) return null;

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    if (!duration) return;
    const rect = e.target.getBoundingClientRect();
    const seekTime = ((e.clientX - rect.left) / rect.width) * duration;
    seekTo(seekTime);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#1f1f1f',
      color: 'white',
      padding: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      borderTop: '1px solid #333',
      zIndex: 1000
    }}>
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: 0 }}>{currentTrack.title}</h4>
        <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>
          {currentTrack.bookTitle}
        </p>
      </div>
      
      <div>
        <button 
          onClick={isPlaying ? pauseTrack : () => playTrack(currentTrack)}
          style={{
            background: '#1db954',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
      </div>

      <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.8rem' }}>
          {formatTime(currentTime)}
        </span>
        
        <div 
          onClick={handleSeek}
          style={{
            flex: 1,
            height: '4px',
            background: '#555',
            borderRadius: '2px',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          <div 
            style={{
              width: `${duration ? (currentTime / duration) * 100 : 0}%`,
              height: '100%',
              background: '#1db954',
              borderRadius: '2px',
              transition: 'width 0.1s ease'
            }}
          />
        </div>
        
        <span style={{ fontSize: '0.8rem' }}>
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}