require("dotenv").config();
const mysql = require("mysql2/promise");

const connectDB = async () => {
  try {
    // console.log("NODE_ENV:", process.env.NODE_ENV);
    // console.log("DB_HOST:", process.env.DB_HOST);
    // console.log("DB_USER:", process.env.DB_USER);
    // console.log("DB_NAME:", process.env.DB_NAME);

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306, // 포트 추가
    });

    // console.log("MySQL에 성공적으로 연결되었습니다.");
    return connection;
  } catch (err) {
    // console.error("MySQL 연결 오류:", err.message);
    // console.error("전체 오류 정보:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
