const express = require("express");
const router = express.Router();
const Diary = require("../models/Diary");
const User = require("../models/User"); // User 모델 가져오기
const { findUser } = require("../util/util");
const bcrypt = require("bcrypt");


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

    // 다이어리 찾기
    const diaries = await Diary.find({
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    }).lean(); // lean()으로 plain object로 변환

    // 각 다이어리의 댓글에 대해 user_avatar를 조회하여 추가
    for (let diary of diaries) {
      for (let comment of diary.comments) {
        const user = await User.findOne({ user_id: comment.user_id }).lean();
        comment.user_avatar = user ? user.user_avatar : "/resource/images/profile.png"; // user_avatar를 추가
      }
    }

    res.status(200).json(diaries);
  } catch (error) {
    console.error("Error fetching diary entry:", error);
    res.status(500).json({ error: "Failed to fetch diary entry", details: error.message });
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

// 댓글 작성 엔드포인트
router.post("/:diaryId/comment", async (req, res) => {
  try {
    const authorization = req.headers.authorization;
    let currentUser = null;

    if (authorization) {
      currentUser = await findUser(authorization);
      if (!currentUser) {
        return res.status(403).json({ error: "Unauthorized user" });
      }
    }

    const { diaryId } = req.params;
    const { content, user_id, password } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const diary = await Diary.findById(diaryId);
    if (!diary) {
      return res.status(404).json({ error: "Diary entry not found" });
    }

    // 새로운 댓글 생성 (비회원일 경우 평문 비밀번호 저장)
    const newComment = {
      user_id: currentUser ? currentUser.user_id : user_id,
      content,
      createdAt: new Date(),
      password: currentUser ? undefined : password, // 평문 비밀번호 저장
    };

    diary.comments.push(newComment);
    await diary.save();

    res.status(201).json({ message: "Comment added successfully", comment: newComment });
  } catch (error) {
    // console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// 댓글 수정 엔드포인트
router.put("/:diaryId/comment/:commentIndex", async (req, res) => {
  try {
    const { diaryId, commentIndex } = req.params;
    const { content, password } = req.body;

    const diary = await Diary.findById(diaryId);
    if (!diary) {
      return res.status(404).json({ error: "Diary entry not found" });
    }

    const comment = diary.comments[commentIndex];
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (!req.headers.authorization) {
      // 비회원 비밀번호 검증 (평문 비교)
      if (password !== comment.password) {
        return res.status(403).json({ error: "Incorrect password" });
      }
    } else {
      // 회원 ID 검증
      const currentUser = await findUser(req.headers.authorization);
      if (!currentUser || currentUser.user_id !== comment.user_id) {
        return res.status(403).json({ error: "Unauthorized user" });
      }
    }

    comment.content = content;
    comment.updatedAt = new Date();
    await diary.save();

    res.status(200).json({ message: "Comment updated successfully" });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ error: "Failed to update comment" });
  }
});

// 댓글 삭제 엔드포인트
router.delete("/:diaryId/comment/:commentIndex", async (req, res) => {
  try {
    const { diaryId, commentIndex } = req.params;
    const { password } = req.body;

    const diary = await Diary.findById(diaryId);
    if (!diary) {
      return res.status(404).json({ error: "Diary entry not found" });
    }

    const comment = diary.comments[commentIndex];
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (!req.headers.authorization) {
      // 비회원 비밀번호 검증 (평문 비교)
      if (password !== comment.password) {
        return res.status(403).json({ error: "Incorrect password" });
      }
    } else {
      // 회원 ID 검증
      const currentUser = await findUser(req.headers.authorization);
      if (!currentUser || currentUser.user_id !== comment.user_id) {
        return res.status(403).json({ error: "Unauthorized user" });
      }
    }

    diary.comments.splice(commentIndex, 1);
    await diary.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});


router.get("/all", async (req, res) => {
  try {
    const diaries = await Diary.find({}); // 모든 다이어리 항목을 가져옵니다
    res.status(200).json(diaries);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch diary entries" });
  }
});


module.exports = router;
