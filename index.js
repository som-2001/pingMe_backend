const express = require("express");
const cors = require("cors");
const connection = require("./connection/Connection");
const authRoute = require("./routes/auth.js");
const userListRoute = require("./routes/userList.js");
const chatRoute = require("./routes/chat.js");
const statusRoute = require("./routes/status.js");
const Chat = require("./model/chatSchema.js");
const User = require("./model/UserSchema.js");
const app = express();
const server = require("http").createServer(app);
const dotenv = require("dotenv");
const admin = require("firebase-admin");
dotenv.config();

const serviceAccountconfig = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Fix multiline key
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountconfig),
});

//https://ping-me-frontend.vercel.app
const io = require("socket.io")(server, {
  cors: {
    origin: "https://ping-me-frontend.vercel.app",
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
app.use("/status", statusRoute);
//chat controller

const chatIo = io.of("/chat");
const users = {};
chatIo.setMaxListeners(20);

const sendNotification = async (senderId, receiverId, message, username) => {
  const user = await User.findById(receiverId);
  if (!user || !user.fcmToken) return console.log("No FCM token found");

  const payload = {
    data: {
      title: username,
      body: message,
      click_action: "FLUTTER_NOTIFICATION_CLICK",
      url: `https://ping-me-frontend.vercel.app/chat/${senderId}`, // URL for redirection
      username: String(username),
      profileImg: String(user.profileImage),
    },
    token: user.fcmToken,
  };

  admin
    .messaging()
    .send(payload)
    .then((response) => console.log("✅ Notification sent:", response))
    .catch((error) => console.log("❌ Notification error:", error));
};

app.post("/chat/send-message", async (req, res) => {
  const { senderId, receiverId, message, username } = req.body;

  const user = await User.findById(receiverId);

  if (user.status === "offline") {
    try {
      sendNotification(senderId, receiverId, message, username);
      res.json({ success: true, message: "Message sent!" });
    } catch (error) {
      res.status(500).json({ error: "Message sending failed" });
    }
  }
});

chatIo.on("connection", (socket) => {
  socket.on("room_join", async (data) => {
    const room = [data.sender_id, data.receiver_id].sort().join("_");
    socket.join(room);
    users[socket.id] = {
      username: data.username,
      userid: data.sender_id,
      room: room,
    };

    try {
      const updateUserStatus = await User.findByIdAndUpdate(
        data.sender_id,
        { status: "online" },
        { new: true }
      );
    } catch (err) {
      console.log(err.message);
    }

    const updateUnreadMessage = await Chat.findOne({
      $or: [
        { sender_id: data.sender_id, receiver_id: data.receiver_id },
        { sender_id: data.receiver_id, receiver_id: data.sender_id },
      ],
    });

    if (
      updateUnreadMessage &&
      updateUnreadMessage?.unread?.id !== data.sender_id
    ) {
      await Chat.findOneAndUpdate(
        {
          $or: [
            { sender_id: data.sender_id, receiver_id: data.receiver_id },
            { sender_id: data.receiver_id, receiver_id: data.sender_id },
          ],
        },
        {
          unread: {
            id: 0,
            count: 0,
          },
        }
      );
    }

    socket.to(`${data.receiver_id}_`).emit("seen_message", data);
    socket.to(room).emit("user_joined", data);
    chatIo.emit("connectUserBroadcastToAll", data);
  });

  // socket.on("pingME_room", (data) => {

  //   console.log(data,"156");
  //   socket.join(data.room);
  //   users[socket.id] = {
  //     username: data.username,
  //     userid: data.sender_id,
  //     room: data.room,
  //   };
  // });

  socket.on("typing_event", (data) => {
    const room = [data.sender_id, data.receiver_id].sort().join("_");
    console.log(data.typing);
    socket.to(room).emit("typing_event", data);
  });

  socket.on("status-upload", (data) => {
    console.log(data);
    socket.broadcast.emit("status-upload", data);
  });

  socket.on("image_message", async (data) => {
    const room = [data.sender_id, data.receiver_id].sort().join("_");

    console.log(data.message);
    console.log(data);
    chatIo.to(room).emit("image_message", data);
  });

  socket.on("message", async (data) => {
    const room = [data.sender_id, data.receiver_id].sort().join("_"); //sender_id is doing the message
    const room1 = `${data.receiver_id}_`; //67a79893dfa91ff5ec20624d_

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
        sender_ref: data.sender_id,
        receiver_ref: data.receiver_id,
        comments: [
          {
            sender_id: data.sender_id,
            receiver_id: data.receiver_id,
            message: data.message,
            username: data.username,
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
              username: data.username,
            },
          },
        },
        {
          new: true,
        }
      );
    }

    // Find the chat between the two users

    const socketsInRoom = socket.adapter.rooms.get(room);

    if (socketsInRoom) {
      // Convert the Set to an array and check if any socket's userId matches data.receiver_id
      const isReceiverInRoom = Array.from(socketsInRoom).some(
        (socketId) => users[socketId]?.userid === data.receiver_id
      );

      if (!isReceiverInRoom) {
        const unreadMessage = await Chat.findOne({
          $or: [
            { sender_id: data.sender_id, receiver_id: data.receiver_id },
            { sender_id: data.receiver_id, receiver_id: data.sender_id },
          ],
        });

        if (unreadMessage) {
          const unreadCount = unreadMessage.unread?.count || 0;

          // Increment the count
          await Chat.findOneAndUpdate(
            {
              $or: [
                { sender_id: data.sender_id, receiver_id: data.receiver_id },
                { sender_id: data.receiver_id, receiver_id: data.sender_id },
              ],
            },
            {
              unread: {
                id: data.sender_id,
                count: unreadCount + 1,
              },
            }
          );
        }
      }
    }
    socket.to(room1).emit("dashboard_message", data);
    chatIo.to(room).emit("message", data);
  });

  socket.on("leave_room", () => {
    const user = users[socket.id];

    if (user && user.room) {
      socket.leave(user.room);
      console.log(`User ${user.username} left room: ${user.room}`);

      // Broadcast to others that the user left
      socket.to(user.room).emit("user_left", { username: user.username });

      // Clear user's room info from `users`
      delete users[socket.id];
    }
  });

  socket.on("disconnect", async (reason) => {
    const user = users[socket.id];
    console.log(user);
    const date = new Date().toISOString();
    try {
      const updateUserStatus = await User.findByIdAndUpdate(
        user.userid,
        { status: "offline", last_seen: date },
        { new: true }
      );
    } catch (err) {
      console.log(err.message);
    }

    if (user) {
      socket.to(user.room).emit("disconnectedUser", { last_seen: date });
      chatIo.emit("disconnectUserBroadcastToAll", {
        last_seen: date,
        id: user.userid,
      });
    }
    if (user) {
      console.log(
        `${user.username} disconnected from room ${user.room} ${user.userid}, reason is ${reason}`
      );
      delete users[socket.id];
    }
  });
});

app.post("/users/update-fcm-token", async (req, res) => {
  const { sender_id, token } = req.body;

  try {
    await User.findByIdAndUpdate(sender_id, { fcmToken: token });
    res.json({ success: true, message: "FCM Token updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update FCM token" });
  }
});

server.listen(3001, () => {
  console.log(`Server is running on port ${3001}`);
});
