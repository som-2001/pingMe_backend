const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      //   unique: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Not a valid email"],
    },
    salt: {
      type: Array,
      required: true,
    },
    username: {
      type: String,
      //   unique: true,
      required: true,
      trim: true,
    },
    fcmToken: {
      type: String,
    },
    status:{
      type:String
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Users", UserSchema);
