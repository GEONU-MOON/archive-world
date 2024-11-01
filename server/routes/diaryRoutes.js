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
    const { year, month, day } = req.params;

    const startDate = new Date(year, month - 1, day);
    const endDate = new Date(year, month - 1, parseInt(day) + 1);

    const diary = await Diary.find({
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    if (diary) {
      res.status(200).json(diary);
    } else {
      res.status(404).json({ error: "No diary entry found for this date" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch diary entry" });
  }
});

// 다이어리 수정 엔드포인트
router.put("/:diaryId/edit", async (req, res) => {
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

    if (diary.user_id !== currentUser.user_id) {
      return res.status(403).json({ error: "You are not authorized to edit this diary" });
    }

    diary.content = content;
    diary.updatedAt = new Date();
    await diary.save();

    res.status(200).json({ message: "Diary entry updated successfully", updatedAt: diary.updatedAt });
  } catch (error) {
    res.status(500).json({ error: "Failed to update diary entry" });
  }
});

// 다이어리 삭제 엔드포인트
router.delete("/:diaryId/delete", async (req, res) => {
  try {
    const currentUser = await findUser(req.headers.authorization);
    if (!currentUser) {
      return res.status(403).json({ error: "Unauthorized user" });
    }

    const { diaryId } = req.params;

    const diary = await Diary.findById(diaryId);
    if (!diary) {
      return res.status(404).json({ error: "Diary entry not found" });
    }

    if (diary.user_id !== currentUser.user_id) {
      return res.status(403).json({ error: "You are not authorized to delete this diary" });
    }

    await Diary.findByIdAndDelete(diaryId);
    res.status(200).json({ message: "Diary entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete diary entry" });
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

// 댓글 조회 엔드포인트
router.get("/:diaryId/comments", async (req, res) => {
  try {
    const { diaryId } = req.params;

    const diary = await Diary.findById(diaryId);
    if (!diary) {
      return res.status(404).json({ error: "Diary entry not found" });
    }

    res.status(200).json(diary.comments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// 댓글 수정 엔드포인트
router.put("/:diaryId/comment/:commentIndex", async (req, res) => {
  try {
    const currentUser = await findUser(req.headers.authorization);
    if (!currentUser) {
      return res.status(403).json({ error: "Unauthorized user" });
    }

    const { diaryId, commentIndex } = req.params;
    const { content } = req.body;

    const diary = await Diary.findById(diaryId);
    if (!diary) {
      return res.status(404).json({ error: "Diary entry not found" });
    }

    const comment = diary.comments[commentIndex];
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.user_id !== currentUser.user_id) {
      return res.status(403).json({ error: "You are not authorized to edit this comment" });
    }

    // 댓글 내용과 updatedAt 필드 업데이트
    comment.content = content;
    comment.updatedAt = new Date();

    await diary.save();
    res.status(200).json({ message: "Comment updated successfully", updatedAt: comment.updatedAt });
  } catch (error) {
    res.status(500).json({ error: "Failed to update comment" });
  }
});

// 댓글 삭제 엔드포인트
router.delete("/:diaryId/comment/:commentIndex", async (req, res) => {
  try {
    const currentUser = await findUser(req.headers.authorization);
    if (!currentUser) {
      return res.status(403).json({ error: "Unauthorized user" });
    }

    const { diaryId, commentIndex } = req.params;

    const diary = await Diary.findById(diaryId);
    if (!diary) {
      return res.status(404).json({ error: "Diary entry not found" });
    }

    const comment = diary.comments[commentIndex];
    if (!comment || comment.user_id !== currentUser.user_id) {
      return res.status(403).json({ error: "You are not authorized to delete this comment" });
    }

    diary.comments.splice(commentIndex, 1);
    await diary.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

module.exports = router;
