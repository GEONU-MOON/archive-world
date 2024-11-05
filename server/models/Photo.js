const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const PhotoSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    comments: [CommentSchema],
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

const Photo = mongoose.model("Photo", PhotoSchema);
module.exports = Photo;
