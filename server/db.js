require("dotenv").config();
const mysql = require("mysql2/promise");

const connectDB = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'pretzel_user',
      password: process.env.DB_PASSWORD || 'your_password',
      database: process.env.DB_NAME || 'pretzel_world',
    });

    console.log("MySQL에 성공적으로 연결되었습니다.");
    return connection;
  } catch (err) {
    console.error("MySQL 연결 오류:", err);
    process.exit(1); // 연결 실패 시 프로세스 종료
  }
};

module.exports = connectDB;
