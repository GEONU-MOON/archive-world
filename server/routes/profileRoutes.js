const express = require("express");
const router = express.Router();
const { imageUploader, uploadToS3 } = require("../imageUploader");
const connectDB = require("../db");
const jwt = require("jsonwebtoken");

// 프로필 사진 업로드
router.post("/upload-profile", imageUploader.single("image"), (req, res, next) => uploadToS3(req, res, next, "profile"), async (req, res) => {
  try {
    const imageURL = req.imageUrl;
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const connection = await connectDB();
    await connection.query("UPDATE Users SET user_avatar = ? WHERE user_id = ?", [imageURL, userId]);
    await connection.end();

    res.status(200).json({ message: "Profile picture uploaded successfully", imageURL });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload profile picture" });
  }
});

// 사용자 정보 조회
router.get("/get-user-info", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const connection = await connectDB();
    const [userRows] = await connection.query("SELECT user_id, user_avatar FROM Users WHERE user_id = ?", [userId]);
    const user = userRows[0];
    await connection.end();

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user info" });
  }
});

module.exports = router;
