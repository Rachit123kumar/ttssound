// models/Chapter.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const ChapterSchema = new Schema(
  {
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    chapterIndex: { type: Number, default: null }, // optional ordering
    titles: { type: Map, of: String, default: {} }, // language => title
    content: { type: Map, of: String, default: {} }, // language => text
    audio: { type: Map, of: String, default: {} }, // language => audio url
    // optional flags or metadata:
    durationSec: { type: Map, of: Number, default: {} }, // optional durations per language
    createdBy: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Chapter || mongoose.model("Chapter", ChapterSchema);
