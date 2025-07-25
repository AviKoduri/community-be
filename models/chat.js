const mongoose =require("mongoose")

const ChatMessageSchema = new mongoose.Schema({
  organisation: { type: mongoose.Schema.Types.ObjectId, ref: "Organisation", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("ChatMessage", ChatMessageSchema);
