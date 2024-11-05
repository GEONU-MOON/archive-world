const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const S3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const allowedExtensions = [".png", ".jpg", ".jpeg", ".bmp"];
const storage = multer.memoryStorage();
const imageUploader = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

async function uploadToS3(req, res, next, folder = "profile") {
  const file = req.file;
  if (!file) {
    console.warn("No file uploaded.");
    return res.status(400).send("No file uploaded.");
  }

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `${folder}/${Date.now()}_${file.originalname}`, // 동적으로 폴더 지정
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    console.log("Uploading to S3 with params:", params);
    const command = new PutObjectCommand(params);
    await S3.send(command);
    console.log("Upload to S3 successful:", params.Key);
    const imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
    req.imageUrl = imageUrl;
    next();
  } catch (err) {
    console.error("Error during S3 upload:", err);
    return res.status(500).send("Error uploading file.");
  }
}


module.exports = { imageUploader, uploadToS3 };
