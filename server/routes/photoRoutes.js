const express = require("express");
const router = express.Router();
const Photo = require("../models/Photo");
const User = require("../models/User");
const { findUser } = require("../util/util");
const { imageUploader, uploadToS3 } = require("../imageUploader");
const multer = require("multer");
const upload = multer(); // 파일이 없는 경우에도 req.body를 파싱할 수 있도록 설정

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
    const photos = await Photo.find({}).lean(); // lean()을 사용하여 plain object로 변환

   
    for (let photo of photos) {
      for (let comment of photo.comments) {
        const user = await User.findOne({ user_id: comment.user_id }).lean();
        comment.profileImageUrl = user ? user.user_avatar : "/resource/images/default-avatar.png"; // 기본 이미지 설정
      }
    }

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

router.put("/:photoId/edit", upload.single("photo"), async (req, res, next) => {
  try {
    const currentUser = await findUser(req.headers.authorization);
    if (!currentUser) {
      return res.status(403).json({ error: "Unauthorized user" });
    }

    const { photoId } = req.params;
    const title = req.body.title; // FormData에서 title 가져오기
    const description = req.body.description; // FormData에서 description 가져오기

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

    // 파일이 있을 경우에만 uploadToS3를 호출
    if (req.file) {
      await uploadToS3(req, res, next, "photo"); // 파일이 있는 경우에만 S3 업로드
      if (req.imageUrl) {
        photo.imageUrl = req.imageUrl;
      }
    }

    photo.updatedAt = new Date();
    await photo.save();

    res.status(200).json({ message: "Photo updated successfully", photo });
  } catch (error) {
    console.error("Error updating photo:", error); // 디버깅 로그
    res.status(500).json({ error: "Failed to update photo" });
  }
});



router.delete("/:photoId/delete", async (req, res) => {
  try {
    // console.log("Starting photo delete process..."); // 시작 로그

    const currentUser = await findUser(req.headers.authorization);
    if (!currentUser) {
      // console.log("Unauthorized user - no valid token"); // 인증 실패 로그
      return res.status(403).json({ error: "Unauthorized user" });
    }
    // console.log("Authorized user:", currentUser.user_id); // 인증 성공 로그

    const { photoId } = req.params;
    const photo = await Photo.findById(photoId);
    
    if (!photo) {
      // console.log(`Photo not found with ID: ${photoId}`); // 사진 없음 로그
      return res.status(404).json({ error: "Photo not found" });
    }
    // console.log("Photo found:", photo); // 사진 존재 로그

    if (photo.user_id !== currentUser.user_id) {
      // console.log("User is not authorized to delete this photo"); // 권한 없음 로그
      return res.status(403).json({ error: "You are not authorized to delete this photo" });
    }

    await Photo.findByIdAndDelete(photoId);
    // console.log("Photo deleted successfully:", photoId); // 삭제 성공 로그
    res.status(200).json({ message: "Photo deleted successfully" });
  } catch (error) {
    // console.error("Error deleting photo:", error); // 삭제 중 에러 로그
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

// 댓글 수정 라우트
router.put("/:photoId/comment/:commentIndex", async (req, res) => {
  try {
    const currentUser = await findUser(req.headers.authorization);
    if (!currentUser) {
      return res.status(403).json({ error: "Unauthorized user" });
    }

    const { photoId, commentIndex } = req.params;
    const { content } = req.body;

    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    const comment = photo.comments[commentIndex];
    if (!comment || comment.user_id !== currentUser.user_id) {
      return res.status(403).json({ error: "You are not authorized to edit this comment" });
    }

    // 댓글 내용 수정
    comment.content = content;
    comment.updatedAt = new Date();

    await photo.save();

    res.status(200).json({ message: "Comment updated successfully", comment });
  } catch (error) {
    // console.error("Error updating comment:", error);
    res.status(500).json({ error: "Failed to update comment" });
  }
});


module.exports = router;
