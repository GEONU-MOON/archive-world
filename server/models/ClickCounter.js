const mongoose = require("mongoose");

const clickCounterSchema = new mongoose.Schema({
  totalCount: {
    type: Number,
    required: true,
    default: 0
  },
  todayCount: {
    type: Number,
    required: true,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("ClickCounter", clickCounterSchema);
