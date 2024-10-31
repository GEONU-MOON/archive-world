const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// 로그인 엔드포인트
router.post("/login", async (req, res) => {
  const { input_id, input_pw } = req.body;

  try {
    const user = await User.findOne({ user_id: input_id });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    if (user.user_pw !== input_pw) {
      return res.status(401).send({ error: "Invalid password" });
    }

    // 비밀번호 일치 시 액세스 토큰 및 리프레시 토큰 발급
    const accessToken = jwt.sign({ userId: user.user_id, userAvatar: user.user_avatar }, process.env.JWT_SECRET, {
      expiresIn: "1h", // 액세스 토큰 유효 시간
    });

    const refreshToken = jwt.sign({ userId: user.user_id }, process.env.REFRESH_SECRET, {
      expiresIn: "7d", // 리프레시 토큰 유효 시간
    });

    // 리프레시 토큰을 데이터베이스에 저장
    user.refreshToken = refreshToken;
    await user.save();

    // 리프레시 토큰을 HTTP-Only 쿠키에 저장
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.status(200).json({ message: "Login success", accessToken });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// 토큰 갱신 엔드포인트
router.post("/token", async (req, res) => {
  const refreshToken = req.cookies.refreshToken; // 쿠키에서 리프레시 토큰 가져오기

  if (!refreshToken) {
    return res.status(403).send({ error: "Access denied, token missing!" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const user = await User.findOne({ user_id: decoded.userId });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).send({ error: "Invalid refresh token" });
    }

    // 새로운 액세스 토큰 발급
    const newAccessToken = jwt.sign({ userId: user.user_id, userAvatar: user.user_avatar }, process.env.JWT_SECRET, {
      expiresIn: "1h", // 새로운 액세스 토큰 유효 시간
    });

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).send({ error: "Invalid refresh token" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    // 쿠키에서 리프레시 토큰 가져오기
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // 리프레시 토큰이 데이터베이스에 존재하면 해당 사용자 정보 가져오기
      const user = await User.findOne({ refreshToken });

      if (user) {
        // 데이터베이스에서 리프레시 토큰 제거
        user.refreshToken = null; // 리프레시 토큰 필드를 null로 설정
        await user.save();
      }
    }

    // 클라이언트 쿠키에서 리프레시 토큰 삭제
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
