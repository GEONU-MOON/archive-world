const connectDB = require("../db");

const getAllPhotos = async () => {
  const connection = await connectDB();
  const [rows] = await connection.query("SELECT * FROM Photo ORDER BY uploadedAt DESC");
  await connection.end();
  return rows;
};

const createPhoto = async (user_id, title, description, imageUrl) => {
  const connection = await connectDB();
  await connection.query(
    "INSERT INTO Photo (user_id, title, description, imageUrl) VALUES (?, ?, ?, ?)",
    [user_id, title, description, imageUrl]
  );
  await connection.end();
};

module.exports = { getAllPhotos, createPhoto };
