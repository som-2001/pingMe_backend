const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  phone_number: {
    type: Number,
  },
  address: {
    type: String,
  },
});
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
    profileImage: {
      type: String,
      required: false,
      validate: {
        validator: function (v) {
          return /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp))$/.test(v);
        },
        message: (props) => `${props.value} is not a valid URL!`,
      },
    },
    about: {
      type: String,
    },
    contact: [contactSchema],
    description: {
      type: String,
    },
    fcmToken: {
      type: String,
    },
    last_seen:{
      type: String
    },
    status: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Users", UserSchema);
