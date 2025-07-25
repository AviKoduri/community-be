const mongoose=require("mongoose")

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatarUrl: String,
  bio: String,
  following:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  blockedUsers:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  organisations:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Organisation' }],
  requestsSent:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  requestsReceived:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports=mongoose.model("User",UserSchema)
