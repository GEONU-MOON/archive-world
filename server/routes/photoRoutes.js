const express = require("express");
const router = express.Router();
const Photo = require("../models/Photo");
const User = require("../models/User");
const { findUser } = require("../util/util");
const { imageUploader, uploadToS3 } = require("../imageUploader");

router.post("/upload", imageUploader.single("photo"), (req, res, next) => uploadToS3(req, res, next, "photo"), async (req, res) => {
  try {
    const currentUser = await findUser(req.headers.authorization);
    if (!currentUser) {
      return res.status(403).json({ error: "Unauthorized user" });
    }

    const { title, description } = req.body;
    const newPhoto = new Photo({
      user_id: currentUser.user_id,
      title,
      description,
      imageUrl: req.imageUrl,
      uploadedAt: new Date(),
    });

    await newPhoto.save();
    res.status(201).json({ message: "Photo uploaded successfully", photo: newPhoto });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload photo" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const photos = await Photo.find({});
    res.status(200).json(photos);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch photos" });
  }
});

router.get("/:photoId", async (req, res) => {
  try {
    const { photoId } = req.params;
    const photo = await Photo.findById(photoId);

    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    res.status(200).json(photo);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch photo" });
  }
});

router.put("/:photoId/edit", imageUploader.single("photo"), uploadToS3, async (req, res) => {
  try {
    const currentUser = await findUser(req.headers.authorization);
    if (!currentUser) {
      return res.status(403).json({ error: "Unauthorized user" });
    }

    const { photoId } = req.params;
    const { title, description } = req.body;

    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    if (photo.user_id !== currentUser.user_id) {
      return res.status(403).json({ error: "You are not authorized to edit this photo" });
    }

    // 제목과 설명 업데이트
    if (title) photo.title = title;
    if (description) photo.description = description;

    // 새로운 이미지가 있으면 URL 업데이트
    if (req.imageUrl) {
      photo.imageUrl = req.imageUrl;
    }

    photo.updatedAt = new Date();

    await photo.save();
    res.status(200).json({ message: "Photo updated successfully", photo });
  } catch (error) {
    console.error("Error updating photo:", error); // 에러 로그 출력
    res.status(500).json({ error: "Failed to update photo" });
  }
});


router.delete("/:photoId/delete", async (req, res) => {
  try {
    const currentUser = await findUser(req.headers.authorization);
    if (!currentUser) {
      return res.status(403).json({ error: "Unauthorized user" });
    }

    const { photoId } = req.params;

    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    if (photo.user_id !== currentUser.user_id) {
      return res.status(403).json({ error: "You are not authorized to delete this photo" });
    }

    await Photo.findByIdAndDelete(photoId);
    res.status(200).json({ message: "Photo deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete photo" });
  }
});

router.post("/:photoId/comment", async (req, res) => {
  try {
    const currentUser = await findUser(req.headers.authorization);
    if (!currentUser) {
      return res.status(403).json({ error: "Unauthorized user" });
    }

    const { photoId } = req.params;
    const { content } = req.body;

    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    const newComment = {
      user_id: currentUser.user_id,
      content,
      createdAt: new Date(),
    };
    photo.comments.push(newComment);

    await photo.save();
    res.status(201).json({ message: "Comment added successfully", comment: newComment });
  } catch (error) {
    res.status(500).json({ error: "Failed to add comment" });
  }
});

router.delete("/:photoId/comment/:commentIndex", async (req, res) => {
  try {
    const currentUser = await findUser(req.headers.authorization);
    if (!currentUser) {
      return res.status(403).json({ error: "Unauthorized user" });
    }

    const { photoId, commentIndex } = req.params;

    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    const comment = photo.comments[commentIndex];
    if (!comment || comment.user_id !== currentUser.user_id) {
      return res.status(403).json({ error: "You are not authorized to delete this comment" });
    }

    photo.comments.splice(commentIndex, 1);
    await photo.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

module.exports = router;
