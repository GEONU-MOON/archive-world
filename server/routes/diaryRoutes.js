const express = require("express");
const router = express.Router();
const connectDB = require("../db");
const { findUser } = require("../util/util");

// 다이어리 작성
router.post("/write", async (req, res) => {
  try {
    const currentUser = await findUser(req.headers.authorization);
    if (!currentUser) return res.status(403).json({ error: "Unauthorized user" });

    const { content } = req.body;
    const user_id = currentUser.id;

    const connection = await connectDB();
    await connection.query("INSERT INTO Diary (user_id, date, content) VALUES (?, NOW(), ?)", [user_id, content]);
    res.status(201).json({ message: "Diary entry created successfully" });
  } catch (error) {
    console.error("Error creating diary entry:", error);
    res.status(500).json({ error: "Failed to create diary entry" });
  }
});

// 특정 날짜의 다이어리 조회
router.get("/:year/:month/:day", async (req, res) => {
  try {
    const { year, month, day } = req.params;
    const startDate = `${year}-${month}-${day}`;
    const endDate = `${year}-${month}-${parseInt(day) + 1}`;

    const connection = await connectDB();
    const [diaries] = await connection.query("SELECT * FROM Diary WHERE date >= ? AND date < ?", [startDate, endDate]);

    if (!diaries.length) return res.status(404).json({ error: "No diary entries found" });

    for (const diary of diaries) {
      const [author] = await connection.query("SELECT user_id FROM Users WHERE id = ?", [diary.user_id]);
      diary.user_id = author.length ? author[0].user_id : "Unknown";

      const [comments] = await connection.query(
        `SELECT C.id, C.content, C.commentIndex, C.user_id, C.guest_user_id, C.createdAt, U.user_id, U.user_avatar
         FROM DiaryComments C
         LEFT JOIN Users U ON C.user_id = U.id
         WHERE C.diary_id = ?
         ORDER BY C.commentIndex`,
        [diary.id]
      );

      for (const comment of comments) {
        comment.user_id = comment.user_id || comment.guest_user_id;
        comment.user_avatar = comment.user_avatar || "/resource/images/profile.png";
      }

      diary.comments = comments;
    }

    res.status(200).json(diaries);
  } catch (error) {
    console.error("Error fetching diary entry:", error);
    res.status(500).json({ error: "Failed to fetch diary entry" });
  }
});

// 다이어리 수정
router.put("/:diaryId/edit", async (req, res) => {
  try {
    const currentUser = await findUser(req.headers.authorization);
    if (!currentUser) return res.status(403).json({ error: "Unauthorized user" });

    const { diaryId } = req.params;
    const { content } = req.body;

    const connection = await connectDB();
    const [diary] = await connection.query("SELECT * FROM Diary WHERE id = ?", [diaryId]);

    if (!diary.length) return res.status(404).json({ error: "Diary entry not found" });
    if (diary[0].user_id !== currentUser.id) return res.status(403).json({ error: "Unauthorized user" });

    await connection.query("UPDATE Diary SET content = ?, updatedAt = NOW() WHERE id = ?", [content, diaryId]);
    res.status(200).json({ message: "Diary entry updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update diary entry" });
  }
});

// 다이어리 삭제
router.delete("/:diaryId/delete", async (req, res) => {
  try {
    const currentUser = await findUser(req.headers.authorization);
    if (!currentUser) return res.status(403).json({ error: "Unauthorized user" });

    const { diaryId } = req.params;
    const connection = await connectDB();

    const [diary] = await connection.query("SELECT * FROM Diary WHERE id = ?", [diaryId]);
    if (!diary.length) return res.status(404).json({ error: "Diary entry not found" });

    if (diary[0].user_id !== currentUser.id) return res.status(403).json({ error: "Unauthorized user" });

    await connection.query("DELETE FROM Diary WHERE id = ?", [diaryId]);
    res.status(200).json({ message: "Diary entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete diary entry" });
  }
});

// 댓글 추가
router.post("/:diaryId/comment", async (req, res) => {
  try {
    const { diaryId } = req.params;
    const { content, user_id, password } = req.body;
    const currentUser = req.headers.authorization ? await findUser(req.headers.authorization) : null;

    const connection = await connectDB();

    const [maxIndexResult] = await connection.query(
      "SELECT COALESCE(MAX(commentIndex), 0) AS maxIndex FROM DiaryComments WHERE diary_id = ?",
      [diaryId]
    );
    const nextIndex = maxIndexResult[0].maxIndex + 1;

    await connection.query(
      "INSERT INTO DiaryComments (diary_id, user_id, guest_user_id, content, password, commentIndex, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      [diaryId, currentUser ? currentUser.id : null, currentUser ? null : user_id, content, currentUser ? null : password, nextIndex]
    );

    res.status(201).json({ message: "Comment added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// 댓글 삭제
router.delete("/:diaryId/comment/:commentId", async (req, res) => {
  try {
    const { diaryId, commentId } = req.params;
    const { password } = req.body;
    const connection = await connectDB();

    // 댓글 조회
    const [comment] = await connection.query("SELECT * FROM DiaryComments WHERE id = ?", [commentId]);
    if (!comment.length) return res.status(404).json({ error: "Comment not found" });

    // 비회원의 경우 비밀번호 검증
    if (!comment[0].user_id && password !== comment[0].password) {
      return res.status(403).json({ error: "Incorrect password" });
    }

    // 댓글 삭제
    await connection.query("DELETE FROM DiaryComments WHERE id = ?", [commentId]);

    // 인덱스 초기화 및 재정렬
    await connection.query("SET @index := 0;");
    await connection.query(
      "UPDATE DiaryComments SET commentIndex = (@index := @index + 1) WHERE diary_id = ? ORDER BY commentIndex;",
      [diaryId]
    );

    // 재정렬된 댓글 목록 반환
    const [updatedComments] = await connection.query(
      `SELECT C.id, C.content, C.commentIndex, C.user_id, C.guest_user_id, C.createdAt, U.user_id, U.user_avatar
       FROM DiaryComments C
       LEFT JOIN Users U ON C.user_id = U.id
       WHERE C.diary_id = ?
       ORDER BY C.commentIndex`,
      [diaryId]
    );

    // 유저 아바타 처리
    for (const comment of updatedComments) {
      comment.user_id = comment.user_id || comment.guest_user_id;
      comment.user_avatar = comment.user_avatar || "/resource/images/profile.png";
    }

    res.status(200).json({ message: "Comment deleted successfully", comments: updatedComments });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

// 댓글 수정
router.put("/:diaryId/comment/:commentId", async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content, password } = req.body;
    const connection = await connectDB();

    const [comment] = await connection.query("SELECT * FROM DiaryComments WHERE id = ?", [commentId]);
    if (!comment.length) return res.status(404).json({ error: "Comment not found" });

    if (!comment[0].user_id && password !== comment[0].password) {
      return res.status(403).json({ error: "Incorrect password" });
    }

    await connection.query("UPDATE DiaryComments SET content = ?, updatedAt = NOW() WHERE id = ?", [content, commentId]);
    res.status(200).json({ message: "Comment updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update comment" });
  }
});

module.exports = router;
