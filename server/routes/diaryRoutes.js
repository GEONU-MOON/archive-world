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
        `SELECT C.*, U.user_id, U.user_avatar
         FROM Comments C
         LEFT JOIN Users U ON C.user_id = U.id
         WHERE C.diary_id = ?`,
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
    // console.error("Error fetching diary entry:", error);
    res.status(500).json({ error: "Failed to fetch diary entry" });
  }
});

// 다이어리 수정
router.put("/:diaryId/edit", async (req, res) => {
  // console.log("Edit Diary Request Params:", req.params);
  // console.log("Edit Diary Request Body:", req.body);

  try {
    const currentUser = await findUser(req.headers.authorization);
    // console.log("Current User:", currentUser);

    if (!currentUser) return res.status(403).json({ error: "Unauthorized user" });

    const { diaryId } = req.params;
    const { content } = req.body;

    const connection = await connectDB();
    const [diary] = await connection.query("SELECT * FROM Diary WHERE id = ?", [diaryId]);
    // console.log("Diary Query Result:", diary);

    if (!diary.length) return res.status(404).json({ error: "Diary entry not found" });
    if (diary[0].user_id !== currentUser.id) return res.status(403).json({ error: "Unauthorized user" });

    const updateResult = await connection.query("UPDATE Diary SET content = ?, updatedAt = NOW() WHERE id = ?", [content, diaryId]);
    // console.log("Update Query Result:", updateResult);

    res.status(200).json({ message: "Diary entry updated successfully" });
  } catch (error) {
    // console.error("Error updating diary entry:", error);
    res.status(500).json({ error: "Failed to update diary entry", details: error.message });
  }
});


// 다이어리 삭제 엔드포인트
router.delete("/:diaryId/delete", async (req, res) => {
  try {
    const currentUser = await findUser(req.headers.authorization);
    // console.log("Current User:", currentUser);

    if (!currentUser) {
      // console.log("Unauthorized user");
      return res.status(403).json({ error: "Unauthorized user" });
    }

    const { diaryId } = req.params;
    // console.log("Diary ID:", diaryId);

    const connection = await connectDB();

    // 다이어리 조회
    const [diary] = await connection.query("SELECT * FROM Diary WHERE id = ?", [diaryId]);
    // console.log("Diary Query Result:", diary);

    if (!diary.length) {
      // console.log("Diary entry not found");
      return res.status(404).json({ error: "Diary entry not found" });
    }

    // 사용자 권한 확인
    // console.log("Diary User ID:", diary[0].user_id, "Current User ID:", currentUser.id);
    if (diary[0].user_id !== currentUser.id) {
      // console.log("Unauthorized user for this diary entry");
      return res.status(403).json({ error: "Unauthorized user" });
    }

    // 다이어리 삭제
    const deleteResult = await connection.query("DELETE FROM Diary WHERE id = ?", [diaryId]);
    // console.log("Delete Query Result:", deleteResult);

    await connection.end();
    res.status(200).json({ message: "Diary entry deleted successfully" });
  } catch (error) {
    // console.error("Error deleting diary entry:", error);
    res.status(500).json({ error: "Failed to delete diary entry", details: error.message });
  }
});


// 댓글 작성 (회원/비회원)
router.post("/:diaryId/comment", async (req, res) => {
  try {
    const authorization = req.headers.authorization;
    let currentUser = null;
    if (authorization) currentUser = await findUser(authorization);

    const { diaryId } = req.params;
    const { content, user_id, password } = req.body;

    const connection = await connectDB();
    await connection.query(
      "INSERT INTO Comments (diary_id, user_id, guest_user_id, content, password, createdAt) VALUES (?, ?, ?, ?, ?, NOW())",
      [diaryId, currentUser ? currentUser.id : null, currentUser ? null : user_id, content, currentUser ? null : password]
    );

    res.status(201).json({ message: "Comment added successfully" });
  } catch (error) {
    // console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// 댓글 삭제
router.delete("/:diaryId/comment/:commentId", async (req, res) => {
  try {
    const { commentId } = req.params;
    const { password } = req.body;
    const connection = await connectDB();

    const [comment] = await connection.query("SELECT * FROM Comments WHERE id = ?", [commentId]);
    if (!comment.length) return res.status(404).json({ error: "Comment not found" });

    // 비회원의 경우 비밀번호 검증
    if (!comment[0].user_id) {
      if (password !== comment[0].password) {
        return res.status(403).json({ error: "Incorrect password" });
      }
    } else {
      // 회원 댓글인 경우 사용자 검증
      const currentUser = await findUser(req.headers.authorization);
      if (!currentUser || currentUser.id !== comment[0].user_id) {
        return res.status(403).json({ error: "Unauthorized user" });
      }
    }

    await connection.query("DELETE FROM Comments WHERE id = ?", [commentId]);
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    // console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

// 댓글 수정
router.put("/:diaryId/comment/:commentId", async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content, password } = req.body;
    const connection = await connectDB();

    const [comment] = await connection.query("SELECT * FROM Comments WHERE id = ?", [commentId]);
    if (!comment.length) return res.status(404).json({ error: "Comment not found" });

    // 비회원의 경우 비밀번호 검증
    if (!comment[0].user_id) {
      if (password !== comment[0].password) {
        return res.status(403).json({ error: "Incorrect password" });
      }
    } else {
      // 회원 댓글인 경우 사용자 검증
      const currentUser = await findUser(req.headers.authorization);
      if (!currentUser || currentUser.id !== comment[0].user_id) {
        return res.status(403).json({ error: "Unauthorized user" });
      }
    }

    await connection.query("UPDATE Comments SET content = ?, updatedAt = NOW() WHERE id = ?", [content, commentId]);
    res.status(200).json({ message: "Comment updated successfully" });
  } catch (error) {
    // console.error("Error updating comment:", error);
    res.status(500).json({ error: "Failed to update comment" });
  }
});



module.exports = router;
