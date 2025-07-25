require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// Connect to MongoDB
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const db = mongoose.connection;

db.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});
db.once("open", () => {
  console.log("Connected to MongoDB");
});
db.on("disconnected", () => {
  console.log("Disconnected from MongoDB");
});

app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // For production, restrict this to your frontend URL
    methods: ["GET", "POST"],
  },
});

// Routers
const subscribersRouter = require("./routes/subscribers");
const usersRouter = require("./routes/user");
const signInRouter = require("./routes/signin");
const organisationRouter = require("./routes/organisation");
const postRouter = require("./routes/post");
const commentRouter = require("./routes/comment");
const chatRouter = require("./routes/chat");

app.use("/subscribers", subscribersRouter);
app.use("/user", usersRouter);
app.use("/signIn", signInRouter);
app.use("/organisation", organisationRouter);
app.use("/post", postRouter);
app.use("/comment", commentRouter);
app.use("/chat", chatRouter);

app.set("io", io);

// Single consolidated connection listener
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Join post room
  socket.on("join_post", (postId) => {
    console.log(`Socket ${socket.id} joining post room ${postId}`);
    socket.join(postId);
  });

  // Join organisation rooms (array of organisation IDs)
  socket.on("join_organisations", (organisationIds) => {
    if (Array.isArray(organisationIds)) {
      organisationIds.forEach((orgId) => {
        socket.join(orgId);
        console.log(`Socket ${socket.id} joined organisation room ${orgId}`);
      });
    } else {
      console.warn(`join_organisations event expects an array, got ${typeof organisationIds}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
