const express = require("express");
const router = express.Router();
const ClickCounter = require("../models/ClickCounter");

// 클릭 수 증가 API
router.post("/clicks/increment", async (req, res) => {
  try {
    // 오늘 날짜를 KST 기준 자정으로 설정
    const today = new Date();
    today.setUTCHours(15, 0, 0, 0); // UTC 기준 오후 3시가 한국 시간 자정입니다.

    // 기존 카운터를 가져옵니다.
    let counter = await ClickCounter.findOne();
    if (!counter) {
      // 카운터가 없을 경우 생성
      counter = new ClickCounter();
    }

    // 날짜가 바뀌었는지 확인
    const lastUpdatedDate = new Date(counter.lastUpdated);
    lastUpdatedDate.setUTCHours(15, 0, 0, 0); // lastUpdated 시간 정보를 KST 자정 기준으로 맞춰 비교

    if (lastUpdatedDate < today) {
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
