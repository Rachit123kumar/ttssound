// models/Book.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const BookSchema = new Schema(
  {
    // multilingual maps: e.g. name.get('en') => 'Art of War'
    name: { type: Map, of: String, required: true },      // { en: "name", hi: "...", ... }
    intro: { type: Map, of: String, default: {} },
    summary: { type: Map, of: String, default: {} },
    author: { type: Map, of: String, default: {} },
    affiliateLink: { type: Map, of: String, default: {} },
    images: { type: Map, of: String, default: {} },       // language => image url
    languages: { type: [String], default: ["en"] },       // array of language codes
    tags: { type: [String], default: [] },
    // optional metadata
    createdBy: { type: String, default: null },          // user id if you have auth
    chapterCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Avoid model overwrite in dev/hot reload:
export default mongoose.models.Book || mongoose.model("Book", BookSchema);
