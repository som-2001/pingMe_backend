const mongoose = require("mongoose");

const statusSchema = new mongoose.Schema({
  message: {
    type: String,
  },
  image: {
    type: String,
  },
});
const userStatusSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    status: statusSchema,

    live: { type: Date, default: Date.now, expires: 3600 * 24 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Status", userStatusSchema);
