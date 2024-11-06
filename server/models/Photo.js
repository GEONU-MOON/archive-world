const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    content: { type: String, required: true },
    password: { type: String, required: false }, // 비회원 비밀번호 필드 추가
    isMember: { type: Boolean, required: true }, // 회원 여부 필드 추가
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
