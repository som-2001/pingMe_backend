const express = require("express");
const cors = require("cors");
const connection = require("./connection/Connection");
const authRoute = require("./routes/auth.js");
const userListRoute = require("./routes/userList.js");
const chatRoute = require("./routes/chat.js");
const Chat = require("./model/chatSchema.js");
const app = express();
const server = require("http").createServer(app);
const dotenv = require("dotenv");
dotenv.config();

//https://ping-me-frontend.vercel.app
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "https://ping-me-frontend.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

connection();
app.use("/auth", authRoute);
app.use("/user", userListRoute);
app.use("/chat", chatRoute);
//chat controller

const chatIo = io.of("/chat");
const users = {};
chatIo.setMaxListeners(20);

chatIo.on("connection", (socket) => {
  socket.on("room_join", (data) => {
    console.log(data);
    socket.join(data.room);
    users[socket.id] = {
      username: data.username,
      userid: data.sender_id,
      room: data.room,
    };
  });

  socket.on("message", async (data) => {
    const alreadyExistsInDB = await Chat.findOne({
      $or: [
        { sender_id: data.sender_id, receiver_id: data.receiver_id },
        { sender_id: data.receiver_id, receiver_id: data.sender_id },
      ],
    });

    if (!alreadyExistsInDB) {
      const newChat = new Chat({
        sender_id: data.sender_id,
        receiver_id: data.receiver_id,
        sender_ref:data.sender_id,
        receiver_ref:data.receiver_id,
        comments: [
          {
            sender_id: data.sender_id,
            receiver_id: data.receiver_id,
            message: data.message,
          },
        ],
      });

      await newChat.save();
    } else {
      await Chat.findByIdAndUpdate(
        alreadyExistsInDB._id,
        {
          $push: {
            comments: {
              sender_id: data.sender_id,
              receiver_id: data.receiver_id,
              message: data.message,
            },
          },
        },
        {
          new: true,
        }
      );
    }
    chatIo.to(data.room).emit("message", data);
  });

  socket.on("disconnect", (reason) => {
    const user = users[socket.id];

    if (user) {
      console.log(
        `${user.username} disconnected from room ${user.room}, reason is ${reason}`
      );
      delete users[socket.id];
    }
  });
});

server.listen(3001, () => {
  console.log(`Server is running on port ${3001}`);
});
