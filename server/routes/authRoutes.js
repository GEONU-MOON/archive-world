const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const connectDB = require("../db");
require("dotenv").config();

// 로그인 엔드포인트
router.post("/login", async (req, res) => {
  const { input_id, input_pw } = req.body;

  try {
    const connection = await connectDB();
    const [userRows] = await connection.query("SELECT * FROM Users WHERE user_id = ?", [input_id]);
    const user = userRows[0];

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    if (user.user_pw !== input_pw) {
      return res.status(401).send({ error: "Invalid password" });
    }

    // 비밀번호 일치 시 액세스 토큰 및 리프레시 토큰 발급
    const accessToken = jwt.sign({ userId: user.user_id, userAvatar: user.user_avatar }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const refreshToken = jwt.sign({ userId: user.user_id }, process.env.REFRESH_SECRET, {
      expiresIn: "7d",
    });

    // 리프레시 토큰 업데이트
    await connection.query("UPDATE Users SET refreshToken = ? WHERE user_id = ?", [refreshToken, user.user_id]);

    // 리프레시 토큰을 HTTP-Only 쿠키에 저장
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.status(200).json({ message: "Login success", accessToken });
    await connection.end();
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// 토큰 갱신 엔드포인트
router.post("/token", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(403).send({ error: "Access denied, token missing!" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const connection = await connectDB();
    const [userRows] = await connection.query("SELECT * FROM Users WHERE user_id = ?", [decoded.userId]);
    const user = userRows[0];

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).send({ error: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign({ userId: user.user_id, userAvatar: user.user_avatar }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ accessToken: newAccessToken });
    await connection.end();
  } catch (error) {
    res.status(403).send({ error: "Invalid refresh token" });
  }
});

// 로그아웃 엔드포인트
router.post("/logout", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const connection = await connectDB();
      await connection.query("UPDATE Users SET refreshToken = NULL WHERE refreshToken = ?", [refreshToken]);
      await connection.end();
    }

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
