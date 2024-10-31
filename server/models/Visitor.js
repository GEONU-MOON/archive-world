const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema({
  visitor_no: {
    type: Number,
    required: true,
  },
  writer: {
    type: String,
    required: true,
  },
  writer_avatar: {
    type: String,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Visitor = mongoose.model("Visitor", visitorSchema);

module.exports = Visitor;
