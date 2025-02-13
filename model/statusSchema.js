const mongoose = require("mongoose");

const userStatusSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["Online", "Offline", "Typing...", "Away"],
    default: "Online",
  },
  lastActive: { type: Date, default: Date.now, expires: 3600*24 },
});

module.exports= mongoose.model("UserStatus", userStatusSchema);
