const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const connectDB = require("../db");

// 방명록 추가
router.post("/add-visitor", async (req, res) => {
  try {
    const { writer, writer_avatar, content, password } = req.body;

    // 비밀번호 해싱
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log(`Hashed password during creation: ${hashedPassword}`); // 디버깅 로그 추가

    const connection = await connectDB();
    await connection.query(
      "INSERT INTO Visitor (writer, writer_avatar, content, password, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())",
      [writer, writer_avatar, content, hashedPassword]
    );

    res.status(201).json({ message: "Visitor successfully created" });
  } catch (error) {
    res.status(500).json({ message: "Failed to create visitor", error: error.message });
  }
});


// 방명록 목록 조회
router.get("/visitors-read", async (req, res) => {
  try {
    const connection = await connectDB();
    const [visitors] = await connection.query("SELECT * FROM Visitor ORDER BY createdAt DESC");

    res.status(200).json(visitors);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve visitors", error: error.message });
  }
});

// 특정 방명록 조회
router.get("/visitor/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await connectDB();
    const [visitor] = await connection.query("SELECT * FROM Visitor WHERE id = ?", [id]);

    if (visitor.length === 0) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    res.status(200).json(visitor[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve visitor", error: error.message });
  }
});

// 방명록 수정
router.put("/visitor-update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { writer, writer_avatar, content, currentPassword } = req.body;

    console.log(`Received update request with password: '${currentPassword}'`);

    const connection = await connectDB();
    const [visitor] = await connection.query("SELECT * FROM Visitor WHERE id = ?", [id]);

    if (visitor.length === 0) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    const storedPassword = visitor[0].password;
    console.log(`Stored hashed password: '${storedPassword}'`);

    // 비밀번호 검증
    const isPasswordCorrect = await bcrypt.compare(currentPassword, storedPassword);
    console.log(`Password comparison result: ${isPasswordCorrect}`);

    if (!isPasswordCorrect) {
      return res.status(403).json({ message: "Incorrect password" });
    }

    // 방명록 수정
    await connection.query(
      "UPDATE Visitor SET writer = ?, writer_avatar = ?, content = ?, updatedAt = NOW() WHERE id = ?",
      [writer, writer_avatar, content, id]
    );

    res.status(200).json({ message: "Visitor successfully updated" });
  } catch (error) {
    console.error("Error updating visitor:", error);
    res.status(500).json({ message: "Failed to update visitor", error: error.message });
  }
});

// 방명록 삭제
router.delete("/visitor-delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword } = req.body;

    const connection = await connectDB();
    const [visitor] = await connection.query("SELECT * FROM Visitor WHERE id = ?", [id]);

    if (visitor.length === 0) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    // console.log(`Received password: ${currentPassword}`);
    // console.log(`Stored hashed password: ${visitor[0].password}`);

    // 비밀번호 검증 (bcrypt 비교)
    const isPasswordCorrect = await bcrypt.compare(currentPassword, visitor[0].password);
    if (!isPasswordCorrect) {
      console.error("Password mismatch");
      return res.status(403).json({ message: "Incorrect password" });
    }

    // 방명록 삭제
    await connection.query("DELETE FROM Visitor WHERE id = ?", [id]);

    res.status(200).json({ message: "Visitor successfully deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete visitor", error: error.message });
  }
});

module.exports = router;
