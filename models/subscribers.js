const mongoose=require("mongoose")
const subscribersSchema = new mongoose.Schema({
name:{
    type:String,
    required:true
},
title:{
    type:String,
    required:true
}
});

module.exports=mongoose.model("Subscribers",subscribersSchema)