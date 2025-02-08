const express = require("express");
const cors = require("cors");
const connection = require("./connection/Connection");
const authRoute = require("./routes/auth");
const app = express();
const server = require("http").createServer(app);
const dotenv=require('dotenv');
dotenv.config();

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

server.listen(3001, () => {
  console.log(`Server is running on port ${3001}`);
});
