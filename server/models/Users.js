const connectDB = require("../db");

const getUserById = async (user_id) => {
  const connection = await connectDB();
  const [rows] = await connection.query("SELECT * FROM User WHERE user_id = ?", [user_id]);
  await connection.end();
  return rows[0];
};

const createUser = async (user_id, user_pw, user_avatar, refreshToken) => {
  const connection = await connectDB();
  await connection.query(
    "INSERT INTO User (user_id, user_pw, user_avatar, refreshToken) VALUES (?, ?, ?, ?)",
    [user_id, user_pw, user_avatar, refreshToken]
  );
  await connection.end();
};

module.exports = { getUserById, createUser };
