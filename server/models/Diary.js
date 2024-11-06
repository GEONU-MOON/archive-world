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
    password: {
      type: String,
      required: false, // 회원이 아닌 사용자에게만 필요
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
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
    timestamps: true,
  }
);

const Diary = mongoose.model("Diary", DiarySchema);
module.exports = Diary;
