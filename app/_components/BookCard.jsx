// components/BookCard.jsx
'use client';
import { useAudio } from '../context/AudioContext';
import Link from 'next/link';

export default function BookCard({ book }) {
  const { playTrack, isPlaying, currentTrack } = useAudio();
  
  const firstChapter = book.chapters[0];
  const isCurrentBookPlaying = currentTrack?.bookId === book.id && isPlaying;

  const handlePlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (firstChapter) {
      playTrack({
        url: firstChapter.url,
        title: firstChapter.title,
        bookTitle: book.title,
        bookId: book.id,
        chapterId: firstChapter.id
      });
    }
  };

  return (
    <Link 
      href={`/book/${book.id}`}
      style={{
        display: 'flex',
        gap: '1rem',
        padding: '1rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        textDecoration: 'none',
        color: 'inherit',
        alignItems: 'center'
      }}
    >
      <div style={{ 
        position: 'relative', 
        width: '80px', 
        height: '80px',
        background: '#f0f0f0',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>📚</div>
        <button 
          onClick={handlePlay}
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            background: '#1db954',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          {isCurrentBookPlaying ? '⏸️' : '▶️'}
        </button>
      </div>
      
      <div>
        <h3 style={{ margin: 0 }}>{book.title}</h3>
        <p style={{ margin: 0, color: '#666' }}>{book.author}</p>
        <span style={{ fontSize: '0.8rem', color: '#888' }}>
          {book.languages.join(', ')}
        </span>
      </div>
    </Link>
  );
}