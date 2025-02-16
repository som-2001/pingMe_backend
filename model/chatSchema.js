const mongoose = require("mongoose");


const commentSchema = new mongoose.Schema(
  {
    sender_id: {
      type: String,
      required: true,
    },
    receiver_id: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required:true
    },
   
    username:{
      type:String,
      required:true
    }
  },
  {
    timestamps: true,
  }
);

const unreadSchema=new mongoose.Schema({
  id:{
    type:String,
    default:0
  },
  count: { type: Number, default: 0 }
})

const chatSchema = new mongoose.Schema(
  {
    sender_id: {
      type: String,
      required: true,
    },
    receiver_id: {
      type: String,
      required: true,
    },
    sender_ref: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    receiver_ref: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    unread:unreadSchema,
    comments: [commentSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Chats", chatSchema);
