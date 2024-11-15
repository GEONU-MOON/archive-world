const express = require("express");
const router = express.Router();
const connectDB = require("../db");

router.get("/check-db", async (req, res) => {
  try {
    const connection = await connectDB();
    const [rows] = await connection.query("SELECT 1 + 1 AS result");
    res.json({ message: "연결 테스트 성공", result: rows[0].result });
  } catch (error) {
    console.error("DB 테스트 오류:", error);
    res.status(500).json({ message: "DB 연결 실패", error: error.message });
  }
});

module.exports = router;
