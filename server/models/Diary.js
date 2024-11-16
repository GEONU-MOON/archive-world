const connectDB = require("../db");

const getAllDiaries = async () => {
  const connection = await connectDB();
  const [rows] = await connection.query("SELECT * FROM Diary ORDER BY date DESC");
  await connection.end();
  return rows;
};

const createDiary = async (user_id, date, content) => {
  const connection = await connectDB();
  await connection.query(
    "INSERT INTO Diary (user_id, date, content) VALUES (?, ?, ?)",
    [user_id, date, content]
  );
  await connection.end();
};

module.exports = { getAllDiaries, createDiary };
