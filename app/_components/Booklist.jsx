// components/BookList.jsx
'use client';
import BookCard from './BookCard';

export default function BookList({ books }) {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {books.map(book => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}