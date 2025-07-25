const mongoose =require("mongoose")
const ReactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  type: { type: String, required: true }, // 'like', 'love', etc.
}, { timestamps: true });
mongoose.exports =mongoose.model("Reaction",ReactionSchema)