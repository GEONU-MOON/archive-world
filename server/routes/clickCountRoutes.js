const express = require("express");
const router = express.Router();
const connectDB = require("../db");

// 클릭 수 조회 API
router.get("/clicks", async (req, res) => {
  try {
    const connection = await connectDB();
    const [rows] = await connection.query("SELECT * FROM ClickCounter LIMIT 1");
    await connection.end();

    if (rows.length === 0) {
      return res.json({ totalCount: 0, todayCount: 0 });
    }

    res.json({ totalCount: rows[0].totalCount, todayCount: rows[0].todayCount });
  } catch (error) {
    console.error("클릭 카운터 조회 오류:", error);
    res.status(500).json({ error: "Failed to fetch click count" });
  }
});

// 클릭 수 증가 API
router.post("/clicks/increment", async (req, res) => {
  try {
    const connection = await connectDB();
    const today = new Date();
    today.setUTCHours(15, 0, 0, 0); // 한국 시간 자정 기준

    // ClickCounter 데이터 조회
    const [rows] = await connection.query("SELECT * FROM ClickCounter LIMIT 1");
    let counter;

    if (rows.length === 0) {
      // 데이터가 없으면 초기화
      await connection.query("INSERT INTO ClickCounter (totalCount, todayCount) VALUES (1, 1)");
    } else {
      counter = rows[0];

      const lastUpdatedDate = new Date(counter.lastUpdated);
      lastUpdatedDate.setUTCHours(15, 0, 0, 0);

      if (lastUpdatedDate < today) {
        // 날짜가 바뀌었으면 todayCount 초기화
        await connection.query("UPDATE ClickCounter SET totalCount = totalCount + 1, todayCount = 1, lastUpdated = NOW()");
      } else {
        // 날짜가 같으면 todayCount 증가
        await connection.query("UPDATE ClickCounter SET totalCount = totalCount + 1, todayCount = todayCount + 1, lastUpdated = NOW()");
      }
    }

    await connection.end();
    res.json({ message: "Click count incremented successfully." });
  } catch (error) {
    console.error("클릭 수 증가 오류:", error);
    res.status(500).json({ error: "Failed to increment click count" });
  }
});

module.exports = router;
