
// app/admin/books/CreateBookModal.jsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateBookModal({ onCreated }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [intro, setIntro] = useState('');
  const [summary, setSummary] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState('');
  const [langs, setLangs] = useState(['en']);
  const [loading, setLoading] = useState(false);

  function toggleLang(code) {
    setLangs((prev) => (prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]));
  }

  async function handleCreate() {
    if (!name) return alert('Please enter a book name');
    setLoading(true);
    try {
      const payload = {
        bookName: name,
        intro,
        summary,
        author,
        imageUrl,
        languages: langs,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      const res = await fetch('/api/admin/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Create failed');
      }
      const data = await res.json();
      const bookId = data.bookId || data.id || data._id;
      setLoading(false);
      setOpen(false);
      // notify parent
      if (onCreated) onCreated(bookId);
      // navigate to create page for adding next chapter right away
      if (bookId) router.push(`/admin/create?bookId=${encodeURIComponent(bookId)}&chapterIndex=1&edit=true`);
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert('Create book error: ' + (err.message || err));
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="px-3 py-2 bg-green-600 text-white rounded">Add new book</button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-2xl p-6 bg-white rounded shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create new book</h3>
              <button onClick={() => setOpen(false)} className="px-2 py-1 rounded border">Close</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Book name (English)" className="p-2 border rounded" />
              <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author" className="p-2 border rounded" />
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Cover image URL" className="p-2 border rounded col-span-2" />
              <textarea value={intro} onChange={(e) => setIntro(e.target.value)} placeholder="Intro" rows={2} className="p-2 border rounded col-span-2" />
              <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Summary" rows={2} className="p-2 border rounded col-span-2" />
              <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma separated)" className="p-2 border rounded" />
            </div>

            <div className="mt-3">
              <div className="text-sm font-medium mb-1">Languages</div>
              <div className="flex flex-wrap gap-2">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'hi', label: 'Hindi' },
                  { code: 'es', label: 'Spanish' },
                  { code: 'fr', label: 'French' },
                  { code: 'ar', label: 'Arabic' },
                ].map(l => (
                  <label key={l.code} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={langs.includes(l.code)} onChange={() => toggleLang(l.code)} />
                    <span>{l.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={handleCreate} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">{loading ? 'Creating...' : 'Create & Add Chapter'}</button>
              <button onClick={() => setOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
