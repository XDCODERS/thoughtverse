const mongoose = require("mongoose");

const thoughtSchema = new mongoose.Schema({
  text: String,
  userId: String,
  upvotes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Thought", thoughtSchema);
