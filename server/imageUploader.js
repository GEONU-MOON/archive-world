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

async function uploadToS3(req, res, next) {
  const file = req.file;

  if (!file) {
    return res.status(400).send("No file uploaded.");
  }

  const uploadDirectory = req.query.directory ?? "";
  const reqExtension = path.extname(file.originalname);

  if (!allowedExtensions.includes(reqExtension)) {
    return res.status(400).send("Unsupported file format.");
  }

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `${uploadDirectory}/${Date.now()}_${file.originalname}`,
    Body: file.buffer,
    ACL: "public-read-write",
    ContentType: file.mimetype,
  };

  try {
    const command = new PutObjectCommand(params);
    await S3.send(command);

    const imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
    req.imageUrl = imageUrl;

    next(); // Proceed to the next middleware/route handler
  } catch (err) {
    return res.status(500).send("Error uploading file.");
  }
}

module.exports = { imageUploader, uploadToS3 };
