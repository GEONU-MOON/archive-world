const jwt = require("jsonwebtoken");
const connectDB = require("../db");
require("dotenv").config();

async function findUser(token) {
  try {
    if (token.startsWith("Bearer ")) {
      token = token.slice(7).trim(); // 'Bearer ' 부분 제거
    }

    // JWT 검증 및 userId 추출
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // MySQL 연결
    const connection = await connectDB();

    // Users 테이블에서 userId로 사용자 조회
    const [rows] = await connection.query(
      "SELECT * FROM Users WHERE user_id = ?",
      [userId]
    );

    await connection.end();

    // 사용자 조회 결과 확인
    if (rows.length === 0) {
      throw new Error("User not found");
    }

    return rows[0]; // 사용자 정보 반환
  } catch (error) {
    console.error("Error finding user:", error.message);
    throw new Error("User not found or invalid token");
  }
}

module.exports = { findUser };
