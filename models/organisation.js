const mongoose=require("mongoose")

const OrganisationSchema = new mongoose.Schema({
  name:        { type: String, unique: true },
  description: String,
  avatarUrl:   String,
  members:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  admins:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports=mongoose.model("Organisation",OrganisationSchema)

