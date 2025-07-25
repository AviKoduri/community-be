const express =require("express")
const router =express.Router()
const User =require("../models/user")
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
//get all
router.post("/",async (req,res)=>{
  const { username, password } = req.body;
  console.log(username,password)
  if (!username || !password) {
    return res.status(400).json({ message: "Invalid username or password" });
  }

    try {
const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 3. Compare password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Username or password is incorrect" });
    }        
     const { password: _, ...userData } = user.toObject();
         const token = jwt.sign(
      userData,
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({token,user:userData})
    } catch (error) {
        res.status(500).json({message:error?.message})
    }

})

module.exports =router