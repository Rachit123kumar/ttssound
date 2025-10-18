import dbConnect from '../../../../lib/dbConnect';
import Chapter from '../../../../models/Chapter';
import Book from '../../../../models/Book';


export async function GET(req) {
try {
const url = new URL(req.url);
const bookId = url.searchParams.get('bookId');
const chapterId = url.searchParams.get('chapterId');


if (!bookId || !chapterId) return new Response('bookId & chapterId required', { status: 400 });


await dbConnect();


const chapter = await Chapter.findOne({ _id: chapterId, book: bookId }).lean();
if (!chapter) return new Response('Chapter not found', { status: 404 });


// Convert Mongoose Maps to plain objects for the client
function mapToObj(m) {
if (!m) return {};
if (m instanceof Map) return Object.fromEntries(m);
return m; // if it's already plain
}


const payload = {
_id: chapter._id,
chapterIndex: chapter.chapterIndex,
titles: mapToObj(chapter.titles),
content: mapToObj(chapter.content),
audio: mapToObj(chapter.audio), // { en: 'https://...', hi: 'https://...' }
durationSec: mapToObj(chapter.durationSec),
createdAt: chapter.createdAt,
updatedAt: chapter.updatedAt,
};


return new Response(JSON.stringify(payload), {
status: 200,
headers: { 'Content-Type': 'application/json' },
});
} catch (err) {
console.error('GET /api/admin/chapters error', err);
return new Response('Server error', { status: 500 });
}
}