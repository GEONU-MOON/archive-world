const connectDB = require("../db");

const getAllVisitors = async () => {
  const connection = await connectDB();
  const [rows] = await connection.query("SELECT * FROM Visitor ORDER BY createdAt DESC");
  await connection.end();
  return rows;
};

const createVisitor = async (visitor_no, writer, password, writer_avatar, content) => {
  const connection = await connectDB();
  await connection.query(
    "INSERT INTO Visitor (visitor_no, writer, password, writer_avatar, content) VALUES (?, ?, ?, ?, ?)",
    [visitor_no, writer, password, writer_avatar, content]
  );
  await connection.end();
};

module.exports = { getAllVisitors, createVisitor };
