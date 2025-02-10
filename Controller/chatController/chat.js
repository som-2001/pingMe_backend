const Chat = require("../../model/chatSchema");

const getMessages = async (req, res) => {
  try {
    const { sender_id, receiver_id, page = 1 } = req.body; 
    const limit = 30;

    const chat = await Chat.findOne({
      $or: [
        { sender_id: sender_id, receiver_id: receiver_id },
        { sender_id: receiver_id, receiver_id: sender_id },
      ],
    });

    if (!chat) {
      return res.status(200).json({ messages: [], totalMessages: 0 });
    }

    const totalMessages = chat.comments.length;

    const totalPages = Math.ceil(totalMessages / limit);
    const skip = (page - 1) * limit;

    const messagesToShow = chat.comments
      .slice(Math.max(0, totalMessages - (skip + limit)), totalMessages - skip)
      // .reverse();

    res.status(200).json({ messages: messagesToShow, totalMessages, totalPages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const getChats = async (req, res) => {
  try {
    const { sender_id } = req.body;

    let users = await Chat.aggregate([
      {
        $match: {
          $or: [{ sender_id: sender_id }, { receiver_id: sender_id }],
        },
      },
      {
        $addFields: {
          sender_id: { $toObjectId: "$sender_id" },
          receiver_id: { $toObjectId: "$receiver_id" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "sender_id",
          foreignField: "_id",
          as: "sender",
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "receiver_id",
          foreignField: "_id",
          as: "receiver",
        },
      },

      {
        $addFields: {
          sortedComments: { $arrayElemAt: ["$comments", -1] },
        },
      },
      {
        $project: {
          _id: 1,
          sender_id: 1,
          receiver_id: 1,
          createdAt: 1,
          sortedComments: 1,
          profileImage:1,
          sender: { $arrayElemAt: ["$sender", 0] },
          receiver: { $arrayElemAt: ["$receiver", 0] },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return res.status(200).json({ users: users });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const uploadImages=async(req,res)=>{

}

module.exports = { getMessages, getChats,uploadImages };
