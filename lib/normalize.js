// lib/normalize.js
/**
 * Convert Mongoose Map-like or Map instances into plain JS objects.
 * Also recursively handle nested objects that may contain Map-like fields.
 */

function isMapLike(v) {
  return v && (v instanceof Map || typeof v.get === "function" && typeof v.entries === "function");
}

function mapLikeToObject(mapLike) {
  if (!mapLike) return {};
  if (mapLike instanceof Map) {
    const out = {};
    for (const [k, v] of mapLike.entries()) out[k] = v;
    return out;
  }
  // Mongoose Map also supports entries()
  if (typeof mapLike.entries === "function") {
    const out = {};
    for (const [k, v] of mapLike.entries()) out[k] = v;
    return out;
  }
  // fallback: already plain object
  if (typeof mapLike === "object") return mapLike;
  return {};
}

function deepNormalize(obj) {
  if (!obj || typeof obj !== "object") return obj;

  // If it's a map-like root
  if (isMapLike(obj)) {
    return deepNormalize(mapLikeToObject(obj));
  }

  // If it's an array, normalize each element
  if (Array.isArray(obj)) {
    return obj.map((x) => deepNormalize(x));
  }

  // Plain object: iterate keys and normalize values
  const out = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];

    if (isMapLike(val)) {
      out[key] = deepNormalize(mapLikeToObject(val));
    } else if (Array.isArray(val)) {
      out[key] = val.map((x) => deepNormalize(x));
    } else if (val && typeof val === "object") {
      out[key] = deepNormalize(val);
    } else {
      out[key] = val;
    }
  }
  return out;
}

/**
 * normalizeBook(bookDoc)
 * - Accepts a Mongoose doc or plain object and returns a plain object
 *   where all Map-like fields are converted to JS objects.
 */
export function normalizeBook(bookDoc) {
  if (!bookDoc) return bookDoc;
  const plain = typeof bookDoc.toObject === "function" ? bookDoc.toObject() : bookDoc;
  return deepNormalize(plain);
}

/**
 * normalizeChapter(chapterDoc)
 */
export function normalizeChapter(chapterDoc) {
  if (!chapterDoc) return chapterDoc;
  const plain = typeof chapterDoc.toObject === "function" ? chapterDoc.toObject() : chapterDoc;
  return deepNormalize(plain);
}

/**
 * Generic: normalize any doc or array of docs
 */
export function normalizeAny(docOrArray) {
  if (!docOrArray) return docOrArray;
  if (Array.isArray(docOrArray)) return docOrArray.map((d) => deepNormalize(typeof d.toObject === "function" ? d.toObject() : d));
  return deepNormalize(typeof docOrArray.toObject === "function" ? docOrArray.toObject() : docOrArray);
}
