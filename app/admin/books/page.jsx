// app/admin/books/page.jsx (server)
import React from 'react';
import {dbConnect} from '../../../lib/mongoose';
import Book from '../../../models/Book';
import Chapter from '../../../models/Chapter';
import Link from 'next/link';

// IMPORTANT: this is a client component, so import with default import (file contains 'use client')
import CreateBookModal from './CreateBookModal';

export default async function AdminBooksIndexPage() {
  await dbConnect();

  const books = await Book.find({}).lean();
  const totals = await Chapter.aggregate([{ $group: { _id: '$book', count: { $sum: 1 } } }]);
  const langCounts = await Chapter.aggregate([
    { $project: { book: 1, audioArr: { $ifNull: [{ $objectToArray: '$audio' }, []] } } },
    { $unwind: { path: '$audioArr', preserveNullAndEmptyArrays: true } },
    { $group: { _id: { book: '$book', lang: '$audioArr.k' }, count: { $sum: 1 } } },
  ]);

  const totalsMap = {};
  totals.forEach((t) => { totalsMap[String(t._id)] = t.count; });

  const langsMap = {};
  langCounts.forEach((l) => {
    const bookId = String(l._id.book);
    const lang = l._id.lang;
    if (!lang) return;
    if (!langsMap[bookId]) langsMap[bookId] = {};
    langsMap[bookId][lang] = l.count;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Books — Admin (SSR)</h1>
        {/* Client modal/component */}
        <CreateBookModal />
      </div>

      <div className="space-y-4">
        {books.length === 0 && <div>No books found.</div>}

        {books.map((book) => {
          const id = String(book._id);
          const title = (book.name && (book.name.en || Object.values(book.name)[0])) || 'Untitled';
          const total = totalsMap[id] || 0;
          const langObj = langsMap[id] || {};
          // compute next chapter index (next human-friendly index = total + 1)
          const nextIndex = total + 1;

          return (
            <div key={id} className="p-4 border rounded flex items-center justify-between">
              <div>
                <div className="font-medium">{title}</div>
                <div className="text-sm text-gray-600">Created: {new Date(book.createdAt).toLocaleString()}</div>
                <div className="mt-2 text-sm">Total chapters: <strong>{total}</strong></div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {Object.keys(langObj).length === 0 && <div className="text-xs text-gray-500">No audio available</div>}
                  {Object.entries(langObj).map(([lang, cnt]) => (
                    <span key={lang} className="text-xs px-2 py-1 bg-gray-100 rounded">{lang}: {cnt}</span>
                  ))}
                </div>
              </div>

              <div className="space-x-2">
                <Link href={`/admin/books/${id}`} className="px-3 py-1 border rounded">View chapters</Link>

                {/* Add next chapter -> navigates to create with bookId & chapterIndex */}
                <Link href={`/admin/create?bookId=${id}&chapterIndex=${nextIndex}&nameOfBook=${title}`} className="px-3 py-1 bg-green-600 text-white rounded">Add next chapter</Link>

                {/* Edit details -> open create with edit flag so create page can fetch details */}
                <Link href={`/admin/create?bookId=${id}&edit=true`} className="px-3 py-1 border rounded">Edit details</Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
