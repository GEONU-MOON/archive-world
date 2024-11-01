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

    // 선택한 날짜의 시작과 끝을 설정하여 범위 검색
    const startDate = new Date(year, month - 1, day);
    const endDate = new Date(year, month - 1, parseInt(day) + 1);

    const diary = await Diary.findOne({
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    if (diary) {
      res.status(200).json(diary); // 다이어리와 댓글 데이터 포함
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
    diary.updatedAt = new Date(); // updatedAt 갱신
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

    // 작성자 확인
    if (diary.user_id !== currentUser.user_id) {
      return res.status(403).json({ error: "You are not authorized to delete this diary" });
    }

    // 다이어리 삭제
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

module.exports = router;
