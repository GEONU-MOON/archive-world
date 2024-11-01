const express = require("express");
const router = express.Router();
const Diary = require("../models/Diary");
const { findUser } = require("../util/util");

// 다이어리 작성 엔드포인트
router.post("/write", async (req, res) => {
  try {
    const currentUser = await findUser(req.headers.authorization);
    if (!currentUser) {
      return res.status(403).json({ error: "Unauthorized user" });
    }

    const { content } = req.body;
    const newDiary = new Diary({
      user_id: currentUser.user_id,
      date: new Date(),
      content,
    });

    await newDiary.save();
    res.status(201).json({ message: "Diary entry created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to create diary entry" });
  }
});

// 특정 날짜의 다이어리 및 댓글 조회 엔드포인트
router.get("/:year/:month/:day", async (req, res) => {
  try {
    const currentUser = await findUser(req.headers.authorization);
    if (!currentUser) {
      return res.status(403).json({ error: "Unauthorized user" });
    }

    const { year, month, day } = req.params;
    const date = new Date(year, month - 1, day);

    const diary = await Diary.findOne({ user_id: currentUser.user_id, date });
    if (diary) {
      res.status(200).json(diary); // 다이어리와 댓글 데이터 포함
    } else {
      res.status(404).json({ error: "No diary entry found for this date" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch diary entry" });
  }
});

// 댓글 작성 엔드포인트
router.post("/:diaryId/comment", async (req, res) => {
  try {
    const currentUser = await findUser(req.headers.authorization);
    if (!currentUser) {
      return res.status(403).json({ error: "Unauthorized user" });
    }

    const { diaryId } = req.params;
    const { content } = req.body;

    const diary = await Diary.findById(diaryId);
    if (!diary) {
      return res.status(404).json({ error: "Diary entry not found" });
    }

    const newComment = {
      user_id: currentUser.user_id,
      content,
      createdAt: new Date(),
    };
    diary.comments.push(newComment);

    await diary.save();
    res.status(201).json({ message: "Comment added successfully", comment: newComment });
  } catch (error) {
    res.status(500).json({ error: "Failed to add comment" });
  }
});

module.exports = router;
