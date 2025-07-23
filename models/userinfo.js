const mongoose = require("mongoose");

const userInfoSchema = new mongoose.Schema({
  ip: String,
  city: String,
  region: String,
  country: String,
  isp: String,
  userAgent: String,
  screen: String,
  platform: String,
  sim: String,
  hashedId: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("UserInfo", userInfoSchema);
