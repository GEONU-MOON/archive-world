const express = require("express");
const router = express.Router();
const connectDB = require("../db");
const { findUser } = require("../util/util");
const { imageUploader, uploadToS3 } = require("../imageUploader");
const multer = require("multer");
const upload = multer();

// 사진 업로드
router.post("/upload", imageUploader.single("photo"), (req, res, next) => uploadToS3(req, res, next, "photo"), async (req, res) => {
  try {
    const currentUser = await findUser(req.headers.authorization);
    if (!currentUser) return res.status(403).json({ error: "Unauthorized user" });

    const { title, description } = req.body;
    const user_id = currentUser.id;
    const imageUrl = req.imageUrl;

    const connection = await connectDB();
    await connection.query(
      "INSERT INTO Photos (user_id, title, description, imageUrl, uploadedAt) VALUES (?, ?, ?, ?, NOW())",
      [user_id, title, description, imageUrl]
    );

    res.status(201).json({ message: "Photo uploaded successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload photo" });
  }
});

// 모든 사진 조회
router.get("/all", async (req, res) => {
  try {
    const connection = await connectDB();
    const [photos] = await connection.query(
      `SELECT P.*, U.user_id AS author_name
       FROM Photos P
       LEFT JOIN Users U ON P.user_id = U.id`
    );

    for (const photo of photos) {
      const [comments] = await connection.query(
        `SELECT C.id, C.content, C.commentIndex, C.user_id, C.guest_user_id, C.createdAt,
                COALESCE(U.user_id, C.guest_user_id) AS author_name,
                COALESCE(U.user_avatar, '/resource/images/profile.png') AS user_avatar
         FROM PhotoComments C
         LEFT JOIN Users U ON C.user_id = U.id
         WHERE C.photo_id = ?
         ORDER BY C.commentIndex`,
        [photo.id]
      );
      

      for (const comment of comments) {
        // 회원이면 author_name (회원의 user_id), 비회원이면 guest_user_id를 표시
        comment.author_name = comment.author_name || comment.guest_user_id;
        comment.user_avatar = comment.user_avatar || "/resource/images/profile.png";
      }

      photo.comments = comments;
    }

    res.status(200).json(photos);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch photos" });
  }
});

// 사진 수정 (제목과 설명만 수정)
router.put("/:photoId/edit", upload.none(), async (req, res) => {
  try {
    const currentUser = await findUser(req.headers.authorization);
    if (!currentUser) return res.status(403).json({ error: "Unauthorized user" });

    const { photoId } = req.params;
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required." });
    }

    const connection = await connectDB();
    const [photo] = await connection.query("SELECT * FROM Photos WHERE id = ?", [photoId]);
    if (!photo.length) return res.status(404).json({ error: "Photo not found" });

    if (photo[0].user_id !== currentUser.id) return res.status(403).json({ error: "Unauthorized user" });

    await connection.query(
      "UPDATE Photos SET title = ?, description = ?, updatedAt = NOW() WHERE id = ?",
      [title, description, photoId]
    );

    res.status(200).json({ message: "Photo updated successfully" });
  } catch (error) {
    console.error("Error updating photo:", error);
    res.status(500).json({ error: "Failed to update photo" });
  }
});

// 사진 삭제
router.delete("/:photoId/delete", async (req, res) => {
  try {
    const currentUser = await findUser(req.headers.authorization);
    if (!currentUser) return res.status(403).json({ error: "Unauthorized user" });

    const { photoId } = req.params;

    const connection = await connectDB();
    const [photo] = await connection.query("SELECT * FROM Photos WHERE id = ?", [photoId]);
    if (!photo.length) return res.status(404).json({ error: "Photo not found" });

    if (photo[0].user_id !== currentUser.id) return res.status(403).json({ error: "Unauthorized user" });

    await connection.query("DELETE FROM Photos WHERE id = ?", [photoId]);
    res.status(200).json({ message: "Photo deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete photo" });
  }
});

// 댓글 추가
router.post("/:photoId/comment", async (req, res) => {
  try {
    const currentUser = req.headers.authorization ? await findUser(req.headers.authorization) : null;
    const { photoId } = req.params;
    const { content, user_id, password } = req.body;

    const connection = await connectDB();
    const [maxIndexResult] = await connection.query(
      "SELECT COALESCE(MAX(commentIndex), 0) AS maxIndex FROM PhotoComments WHERE photo_id = ?",
      [photoId]
    );
    const nextIndex = maxIndexResult[0].maxIndex + 1;

    await connection.query(
      "INSERT INTO PhotoComments (photo_id, user_id, guest_user_id, content, password, commentIndex, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      [photoId, currentUser ? currentUser.id : null, currentUser ? null : user_id, content, currentUser ? null : password, nextIndex]
    );

    res.status(201).json({ message: "Comment added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// 댓글 삭제 및 인덱스 재정렬
router.delete("/:photoId/comment/:commentId", async (req, res) => {
  try {
    const currentUser = req.headers.authorization ? await findUser(req.headers.authorization) : null;
    const { photoId, commentId } = req.params;
    const { password } = req.body;

    const connection = await connectDB();
    const [comment] = await connection.query("SELECT * FROM PhotoComments WHERE id = ?", [commentId]);
    if (!comment.length) return res.status(404).json({ error: "Comment not found" });

    // 비회원 검증
    if (!comment[0].user_id && password !== comment[0].password) return res.status(403).json({ error: "Incorrect password" });
    // 회원 검증
    if (comment[0].user_id && (!currentUser || currentUser.id !== comment[0].user_id)) return res.status(403).json({ error: "Unauthorized user" });

    // 댓글 삭제
    await connection.query("DELETE FROM PhotoComments WHERE id = ?", [commentId]);

    // 댓글 인덱스 재정렬 (서브 쿼리 사용)
    await connection.query(
      `UPDATE PhotoComments C
       JOIN (
         SELECT id, ROW_NUMBER() OVER (ORDER BY createdAt) AS newIndex
         FROM PhotoComments
         WHERE photo_id = ?
       ) AS sortedComments
       ON C.id = sortedComments.id
       SET C.commentIndex = sortedComments.newIndex`,
      [photoId]
    );

    res.status(200).json({ message: "Comment deleted and indexes updated successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

// 댓글 수정
router.put("/:photoId/comment/:commentId", async (req, res) => {
  try {
    const currentUser = req.headers.authorization ? await findUser(req.headers.authorization) : null;
    const { commentId } = req.params;
    const { content, password } = req.body;

    const connection = await connectDB();
    const [comment] = await connection.query("SELECT * FROM PhotoComments WHERE id = ?", [commentId]);
    if (!comment.length) return res.status(404).json({ error: "Comment not found" });

    if (!comment[0].user_id && password !== comment[0].password) return res.status(403).json({ error: "Incorrect password" });
    if (comment[0].user_id && (!currentUser || currentUser.id !== comment[0].user_id)) return res.status(403).json({ error: "Unauthorized user" });

    await connection.query("UPDATE PhotoComments SET content = ?, updatedAt = NOW() WHERE id = ?", [content, commentId]);
    res.status(200).json({ message: "Comment updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update comment" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const connection = await connectDB();
    const [photos] = await connection.query("SELECT * FROM Photos ORDER BY uploadedAt DESC LIMIT 3");

    // 유저 정보를 추가
    for (const photo of photos) {
      const [user] = await connection.query("SELECT user_id FROM Users WHERE id = ?", [photo.user_id]);
      photo.author_name = user.length ? user[0].user_id : "Unknown";
    }

    res.status(200).json(photos);
  } catch (error) {
    console.error("Error fetching photos:", error);
    res.status(500).json({ error: "Failed to fetch photos" });
  }
});


module.exports = router;
