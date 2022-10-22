const express = require("express");
const dbConnect = require("./db");
const Comment = require("./models/comment");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());

dbConnect();
// Routes
app.post("/api/comments", (req, res) => {
  try {
    const comment = new Comment({
      username: req.body.username,
      comment: req.body.comment,
    });
    comment.save();
    res.send({ isSuccess: true, data: comment });
  } catch (error) {
    console.log(error?.message);
    res.send({ isSuccess: false, error: error.message });
  }
});

app.get("/api/comments", async (req, res) => {
  try {
    const comments = await Comment.find();
    res.send({ isSuccess: true, data: comments });
  } catch (error) {
    console.log(error?.message);
    res.send({ isSuccess: false, error: error.message });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});

const io = require("socket.io")(server);

io.on("connection", (socket) => {
  console.log("new connection", socket.id);
  socket.on("comment", (data) => {
    data.time = new Date();
    socket.broadcast.emit("comment", data);
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });
});
