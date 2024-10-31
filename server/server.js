const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const app = express();
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const visitorRoutes = require("./routes/visitorRoutes");

const PORT = process.env.PORT || 3000;

const connectDB = require("./db");
connectDB();

app.use(express.static(path.join(__dirname, "../public")));

// JSON 및 URL-encoded 데이터의 최대 크기 제한을 설정
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cookieParser());
app.use("/auth", authRoutes);
app.use(profileRoutes);
app.use("/visitors", visitorRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
