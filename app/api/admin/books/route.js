// app/api/admin/books/route.js
import {dbConnect} from '../../../../lib/mongoose';
import Book from '../../../../models/Book';
import { normalizeAny } from '../../../../lib/normalize';

/**
 * Helper: convert either a plain map-like object or a string into a map-object
 * suitable for storing in your Book schema (language keys -> values).
 * If value is an object (already map-like) return as-is.
 * If value is a string, store under 'en' key by default.
 */
function toLangMap(val) {
  if (val == null) return undefined;
  if (typeof val === 'object' && !Array.isArray(val)) return val;
  return { en: String(val) };
}

/**
 * Allowed update fields for PUT
 */
const ALLOWED_FIELDS = new Set([
  'name', 'bookName', 'intro', 'summary', 'author', 'images', 'languages', 'tags', 'affiliateLink', 'createdBy', 'chapterCount'
]);

/**
 * GET: /api/admin/books?bookId=...
 * POST: create book (JSON body)
 *   expected shape (examples):
 *    { bookName: "My Book", intro: "...", summary: "...", author: "...", imageUrl: "...", languages: ['en','hi'], tags: ['x','y'], affiliateLink: '...' }
 *    OR you may provide pre-constructed map fields:
 *    { name: { en: 'My Book', hi: 'Kitab' }, intro: { en: '...' }, images: { en: 'https://...' } }
 *
 * PUT: update existing book (JSON body must include bookId). Fields same as POST.
 */

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const bookId = url.searchParams.get('bookId');
    if (!bookId) return new Response('bookId query is required', { status: 400 });

    await dbConnect();
    const bookDoc = await Book.findById(bookId).lean();
    if (!bookDoc) return new Response('Book not found', { status: 404 });

    const bookPlain = normalizeAny(bookDoc);
    return new Response(JSON.stringify({ book: bookPlain }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('GET /api/admin/books error', err);
    return new Response('Server error', { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    // Accept either bookName or name
    const bookName = body.bookName ?? (body.name && (typeof body.name === 'string' ? body.name : undefined));
    const doc = {};

    // name
    if (body.name) {
      // if it's already an object map, use it; if a string fallback to bookName below
      if (typeof body.name === 'object') doc.name = body.name;
    }
    if (!doc.name && bookName) doc.name = toLangMap(bookName);

    // intro/summary/author/images/affiliateLink
    if (body.intro) doc.intro = toLangMap(body.intro);
    if (body.summary) doc.summary = toLangMap(body.summary);
    if (body.author) doc.author = toLangMap(body.author);
    if (body.images || body.imageUrl) {
      if (body.images && typeof body.images === 'object') doc.images = body.images;
      else if (body.imageUrl) doc.images = toLangMap(body.imageUrl);
    }
    if (body.affiliateLink) {
      // store affiliate links as map or string
      doc.affiliateLink = typeof body.affiliateLink === 'object' ? body.affiliateLink : toLangMap(body.affiliateLink);
    }

    // languages (array)
    if (Array.isArray(body.languages)) doc.languages = body.languages;
    // tags
    if (Array.isArray(body.tags)) doc.tags = body.tags;
    else if (typeof body.tags === 'string') doc.tags = body.tags.split(',').map(t => t.trim()).filter(Boolean);

    if (body.createdBy) doc.createdBy = String(body.createdBy);
    if (typeof body.chapterCount === 'number') doc.chapterCount = body.chapterCount;

    // Validation: ensure name exists (BookSchema requires name)
    if (!doc.name) return new Response('Missing book name (bookName or name required)', { status: 400 });

    await dbConnect();
    const book = new Book(doc);
    const saved = await book.save();

    const savedPlain = normalizeAny(saved.toObject ? saved.toObject() : saved);
    return new Response(JSON.stringify({ bookId: saved._id, book: savedPlain }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('POST /api/admin/books error', err);
    return new Response(String(err.message || 'Server error'), { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const bookId = body.bookId || body.id || body._id;
    if (!bookId) return new Response('bookId required in body', { status: 400 });

    // Build update object only from allowed fields
    const update = {};

    // name/bookName
    if (body.name) {
      update.name = typeof body.name === 'object' ? body.name : toLangMap(body.name);
    } else if (body.bookName) {
      update.name = toLangMap(body.bookName);
    }

    if (body.intro !== undefined) update.intro = toLangMap(body.intro);
    if (body.summary !== undefined) update.summary = toLangMap(body.summary);
    if (body.author !== undefined) update.author = toLangMap(body.author);

    if (body.images !== undefined) {
      update.images = typeof body.images === 'object' ? body.images : toLangMap(body.images);
    } else if (body.imageUrl !== undefined) {
      update.images = toLangMap(body.imageUrl);
    }

    if (body.affiliateLink !== undefined) update.affiliateLink = typeof body.affiliateLink === 'object' ? body.affiliateLink : toLangMap(body.affiliateLink);

    if (Array.isArray(body.languages)) update.languages = body.languages;
    if (Array.isArray(body.tags)) update.tags = body.tags;
    else if (typeof body.tags === 'string') update.tags = body.tags.split(',').map(t => t.trim()).filter(Boolean);

    if (body.createdBy !== undefined) update.createdBy = body.createdBy;
    if (typeof body.chapterCount === 'number') update.chapterCount = body.chapterCount;

    if (Object.keys(update).length === 0) return new Response('No valid update fields provided', { status: 400 });

    await dbConnect();
    const updated = await Book.findByIdAndUpdate(bookId, { $set: update }, { new: true, runValidators: true }).lean();
    if (!updated) return new Response('Book not found', { status: 404 });

    const updatedPlain = normalizeAny(updated);
    return new Response(JSON.stringify({ bookId: updated._id, book: updatedPlain }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('PUT /api/admin/books error', err);
    return new Response(String(err.message || 'Server error'), { status: 500 });
  }
}
