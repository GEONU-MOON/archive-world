require("dotenv").config();
const mongoose = require("mongoose");
const mongoURI = process.env.DB_URI;

// MongoDB 연결
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("MongoDB에 연결되었습니다.");
  } catch (err) {
    console.error("MongoDB 연결 오류:", err);
    process.exit(1); // 연결 실패 시 프로세스 종료
  }
};

// 이 함수를 다른 파일에서 사용할 수 있도록 export
module.exports = connectDB;
