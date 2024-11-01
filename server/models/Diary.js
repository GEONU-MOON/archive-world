const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const DiarySchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    comments: [CommentSchema],
  },
  {
    versionKey: false,
    timestamps: true, // createdAt과 updatedAt 필드를 자동으로 관리
  },
);

const Diary = mongoose.model("Diary", DiarySchema);
module.exports = Diary;
