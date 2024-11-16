const jwt = require("jsonwebtoken");
const User = require("../models/Users");
require("dotenv").config();

async function findUser(token) {
  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length).trimLeft();
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findOne({ user_id: decoded.userId });

  if (!user) {
    throw new Error("User not Found");
  }
  return user;
}

module.exports = { findUser };
