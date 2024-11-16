const connectDB = require("../db");

const getClickCounter = async () => {
  const connection = await connectDB();
  const [rows] = await connection.query("SELECT * FROM ClickCounter LIMIT 1");
  await connection.end();
  return rows[0];
};

const updateClickCounter = async (totalCount, todayCount) => {
  const connection = await connectDB();
  await connection.query(
    "UPDATE ClickCounter SET totalCount = ?, todayCount = ?, lastUpdated = NOW()",
    [totalCount, todayCount]
  );
  await connection.end();
};

module.exports = { getClickCounter, updateClickCounter };
