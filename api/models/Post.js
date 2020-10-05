const mongoose = require("mongoose");

const schema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  dateCreated: { type: Date, default: new Date() },
});

module.exports = mongoose.model("Post", schema);
