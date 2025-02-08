const Chat = require("../../model/chatSchema");

const getMessages = async (req, res) => {
  try {
    const { sender_id, receiver_id, page = 1 } = req.body; // Get sender, receiver & page
    const limit = 10; // Number of messages per page

    // Find chat between sender and receiver
    const chat = await Chat.findOne({
      $or: [
        { sender_id: sender_id, receiver_id: receiver_id },
        { sender_id: receiver_id, receiver_id: sender_id },
      ],
    });

    if (!chat) {
      return res.status(200).json({ messages: [], totalMessages: 0 });
    }

    // Get total messages count
    const totalMessages = chat.comments.length;

    // Paginate messages (fetch from the latest)
    const paginatedMessages = chat.comments
      .slice()

      .slice((page - 1) * limit, page * limit);

    res.status(200).json({ messages: paginatedMessages, totalMessages });
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

module.exports = { getMessages, getChats };
