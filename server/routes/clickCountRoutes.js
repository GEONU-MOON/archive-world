const express = require("express");
const router = express.Router();
const ClickCounter = require("../models/ClickCounter");

// 클릭 수 증가 API
router.post("/clicks/increment", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 자정으로 설정하여 날짜만 비교

    // 기존 카운터를 가져옵니다.
    let counter = await ClickCounter.findOne();
    if (!counter) {
      // 카운터가 없을 경우 생성
      counter = new ClickCounter();
    }

    // 날짜가 바뀌었는지 확인
    if (counter.lastUpdated < today) {
      counter.todayCount = 1; // 새로 초기화
    } else {
      counter.todayCount += 1;
    }

    counter.totalCount += 1; // 총 카운트를 증가
    counter.lastUpdated = Date.now(); // 업데이트 날짜 변경

    // 저장
    await counter.save();

    res.json({ totalCount: counter.totalCount, todayCount: counter.todayCount });
  } catch (error) {
    res.status(500).json({ error: "Failed to increment click count" });
  }
});


// 클릭 수 조회 API
router.get("/clicks", async (req, res) => {
  try {
    const counter = await ClickCounter.findOne() || { totalCount: 0, todayCount: 0 };
    res.json({ totalCount: counter.totalCount, todayCount: counter.todayCount });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch click count" });
  }
});

module.exports = router;