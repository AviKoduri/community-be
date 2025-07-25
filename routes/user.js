const express =require("express")
const router =express.Router()
const User =require("../models/user")
const bcrypt = require('bcryptjs');
const organisation = require("../models/organisation");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../utils/authmiddleware");
//get all
router.get("/",authMiddleware,async  (req,res)=>{
    try {
    // req.user.organisation can come from your decoded JWT/session
    console.log(req.user,"jhvh")
    const filter = { organisations: { $in: req.user.organisations } };
    console.log(filter,"filter")
    const users = await User.find(filter);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
    // try {
    //     const users =await User.find()
    //     res.json(users)
    // } catch (error) {
    //     res.status(500).json({message:error?.message})
    // }

})
//get one
router.get("/:id",getUser,(req,res)=>{
res.json(res.user)
})
//update
router.patch("/:id",getUser,async(req,res)=>{
  if (req.body.username !== undefined) {
    res.user.username = req.body.username;
  }
  if (req.body.email !== undefined) {
    res.user.email = req.body.email;
  }
  if (req.body.avatarUrl !== undefined) {
    res.user.avatarUrl = req.body.avatarUrl;
  }
  if (req.body.bio !== undefined) {
    res.user.bio = req.body.bio;
  }
if (req.body.organisations !== undefined && Array.isArray(req.body.organisations)) {
    const oldOrgs = res.user.organisations.map(orgId => orgId.toString()); // previous org IDs as strings
    const newOrgs = req.body.organisations; // new org IDs as strings

    // Set new organisations for the user
    res.user.organisations = newOrgs;

    // Find which orgs the user was added to or removed from
    const addedOrgs = newOrgs.filter(id => !oldOrgs.includes(id));
    const removedOrgs = oldOrgs.filter(id => !newOrgs.includes(id));

    // Add user to newly joined orgs
    if (addedOrgs.length > 0) {
      await organisation.updateMany(
        { _id: { $in: addedOrgs } },
        { $addToSet: { members: res.user._id } }
      );
    }

    // Remove user from orgs they left
    if (removedOrgs.length > 0) {
      await organisation.updateMany(
        { _id: { $in: removedOrgs } },
        { $pull: { members: res.user._id } }
      );
    }
  }
try {
    const updatedUser = await res.user.save()
    res.json(updatedUser)
} catch (error) {
            res.status(400).json({message:error?.message})

}
})
//create
router.post("/",async (req,res)=>{
    try {
           const bcryptPassword = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, bcryptPassword);

    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword, // Hash this before saving in production!
      avatarUrl: req.body.avatarUrl,
      bio: req.body.bio,
      organisations: req.body.organisations
    });
    const newUser =await user.save()
        if (Array.isArray(req.body.organisations) && req.body.organisations.length > 0) {
      await organisation.updateMany(
        { _id: { $in: req.body.organisations } },
        { $addToSet: { members: newUser._id } }
      );
    }
    res.status(201).json(newUser)
} catch (error) {
        res.status(400).json({message:error?.message})
    
}
})
//delete
router.delete("/:id",getUser,async(req,res)=>{
try {
    await res.user.deleteOne();
    res.json({message:"Deleted"})
} catch (error) {
        res.status(500).json({message:error?.message})
    
}
})

async function getUser(req,res,next) {
    let users 
    try {
        users =await User.findById(req.params.id)
        if(users == null){
            return res.status(401).json({message:"cant not find subscriber"})
        }
    } catch (error) {
        res.status(500).json({message:error?.message})
        
    }
    res.user=users
    next()
}


module.exports =router