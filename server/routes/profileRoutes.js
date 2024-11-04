const express = require("express");
const router = express.Router();
const { imageUploader, uploadToS3 } = require("../imageUploader");
const { findUser } = require("../util/util");


router.post("/upload-profile", imageUploader.single("image"), (req, res, next) => uploadToS3(req, res, next, "profile"), async (req, res) => {
  try {
    const imageURL = req.imageUrl;
    const currentUser = await findUser(req.headers.authorization);
    currentUser.user_avatar = imageURL;
    await currentUser.save();
    res.status(200).json({ message: "Profile picture uploaded successfully", imageURL });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload profile picture" });
  }
});

router.get("/get-user-info", async (req, res) => {
  try {
    // findUser 함수를 사용하여 현재 사용자의 정보를 가져옴.
    const currentUser = await findUser(req.headers.authorization);

    if (currentUser) {
      res.status(200).json({
        user_id: currentUser.user_id,
        user_avatar: currentUser.user_avatar,
      });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    // console.error("Error fetching user info:", error);
    res.status(500).json({ error: "Failed to fetch user info" });
  }
});

module.exports = router;
