const express = require("express");
const router = express.Router();
const Comment = require("../models/comment");
const Post = require("../models/post");
const authMiddleware = require("../utils/authmiddleware");

// Get comments for a specific post
router.get("/post/:postId", async (req, res) => {
  try {
    const postId = req.params.postId;
    const comments = await Comment.find({ post: postId })
      .populate("author", "username avatarUrl")
      .sort({ createdAt: -1 }); // oldest first or (-1) newest first
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create comment on a post
router.post("/",authMiddleware, async (req, res) => {
  const io = req.app.get("io"); // get io instance

  const { postId, content } = req.body;
  if (!postId || !content) {
    return res.status(400).json({ message: "postId and content required" });
  }

  try {
    // Create new comment
    const comment = new Comment({
      post: postId,
      author: req.user._id, // set from auth middleware
      content,
    });

    const savedComment = await comment.save();

    // Push comment to post's comments array (reference)
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: savedComment._id }
    });

    // Populate author for response and socket emit
const populatedComment = await savedComment.populate('author', 'username avatarUrl');

    // Emit new comment event via Socket.io — send to room named by postId
    io.to(postId).emit("new_comment", populatedComment);

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
