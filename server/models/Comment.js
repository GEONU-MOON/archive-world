const connectDB = require("../db");

const getCommentsByDiaryId = async (diary_id) => {
  try {
    const connection = await connectDB();
    const [comments] = await connection.query(
      "SELECT * FROM Comment WHERE diary_id = ? ORDER BY createdAt DESC",
      [diary_id]
    );
    await connection.end();
    return comments;
  } catch (error) {
    console.error("Error fetching comments for diary:", error);
    throw error;
  }
};

const getCommentsByPhotoId = async (photo_id) => {
  try {
    const connection = await connectDB();
    const [comments] = await connection.query(
      "SELECT * FROM Comment WHERE photo_id = ? ORDER BY createdAt DESC",
      [photo_id]
    );
    await connection.end();
    return comments;
  } catch (error) {
    console.error("Error fetching comments for photo:", error);
    throw error;
  }
};


const createCommentForDiary = async (diary_id, user_id, content, password, isMember) => {
  const connection = await connectDB();
  await connection.query(
    "INSERT INTO Comment (diary_id, user_id, content, password, isMember) VALUES (?, ?, ?, ?, ?)",
    [diary_id, user_id, content, password, isMember]
  );
  await connection.end();
};

const createCommentForPhoto = async (photo_id, user_id, content, password, isMember) => {
  const connection = await connectDB();
  await connection.query(
    "INSERT INTO Comment (photo_id, user_id, content, password, isMember) VALUES (?, ?, ?, ?, ?)",
    [photo_id, user_id, content, password, isMember]
  );
  await connection.end();
};

module.exports = {
  getCommentsByDiaryId,
  getCommentsByPhotoId,
  createCommentForDiary,
  createCommentForPhoto,
};
