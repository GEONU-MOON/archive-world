const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    user_pw: {
      type: String,
      required: true,
      unique: true,
    },
    user_avatar: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    versionKey: false,
  },
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
