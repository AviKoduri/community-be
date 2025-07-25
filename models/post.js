const mongoose= require("mongoose");

const PostSchema = new mongoose.Schema({
  author:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organisation:  { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation' },
  content:       { type: String, required: true },
  mediaUrls:     [String], // Array of image/video URLs
  likes:         [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reactions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String }, // Example: 'like', 'love'
    _id: false
  }],
  comments:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
}, { timestamps: true });


module.exports = mongoose.model("Post", PostSchema);
