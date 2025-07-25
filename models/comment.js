const mongoose =require("mongoose")
const CommentSchema = new mongoose.Schema({
  post:    { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  likes:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  edited:  { type: Boolean, default: false },
}, { timestamps: true });

module.exports=mongoose.model("Comment",CommentSchema)
