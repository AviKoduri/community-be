const express =require("express")
const router =express.Router()
const Post = require("../models/post"); // Correct
const authMiddleware = require("../utils/authmiddleware");


//
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).array('media'); // For multiple files

const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: "doc9mueyf",
  api_key: "212757494956183",
  api_secret: "MgYC64P55CLlrhVDjUyPwmI9S3E"
})
//get all
router.get("/",authMiddleware,async (req, res) => {
  try {
     const skip = parseInt(req.query.skip, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 10;
    const filter = { organisation: { $in: req.user.organisations } };
console.log("enter to post",filter)
    const posts = await Post.find(filter).skip(skip)
    .populate("author")
    .limit(limit)
    .sort({ createdAt: -1 });
    console.log("posts",posts)
      const totalCount = await Post.countDocuments(filter);
res.json({ posts, totalCount });

  } catch (error) {
    res.status(500).json({ message: error?.message });
  }
});
//get one
router.get("/:id",getPost,(req,res)=>{
res.json(res.post)
})
//update--pending
// router.patch("/:id",getPost,async(req,res)=>{
//   if (req.body.name !== undefined) {
//     res.organisation.name = req.body.name;
//   }
//   if (req.body.description !== undefined) {
//     res.organisation.description = req.body.description;
//   }
//   if (req.body.members !== undefined) {
//     res.organisation.members = req.body.members;
//   }
//   if (req.body.admins !== undefined) {
//     res.organisation.admins = req.body.admins;
//   }

// try {
//     const updatedOrganisation = await res.organisation.save()
//     res.json(updatedOrganisation)
// } catch (error) {
//             res.status(400).json({message:error?.message})

// }
// })

//likes
// PATCH /:id/like
router.patch("/:id/like", getPost, async (req, res) => {
  console.log("enter")
  const userId = req.body.userId; // The user's id sent in the body
console.log("User ID:", userId);
  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  const likes = res.post.likes.map(id => id.toString()); // Convert ObjectIds to strings
  const userIdStr = userId.toString();

  // Check if present, then remove; else add
  if (likes.includes(userIdStr)) {
    // Unlike - remove userId
    res.post.likes = res.post.likes.filter(id => id.toString() !== userIdStr);
  } else {
    // Like - add userId
    res.post.likes.push(userId);
  }

  try {
    const updatedPost = await res.post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//create
router.post("/", upload, async (req, res) => {
  try {
    // Upload all files (if any)
    let mediaUrls = [];
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const base64str = file.buffer.toString('base64');
        const dataUri = `data:${file.mimetype};base64,${base64str}`;
        const uploadResult = await cloudinary.uploader.upload(dataUri, {
          resource_type: "auto", // supports both images and videos
        });
        mediaUrls.push(uploadResult.secure_url);
      }
    }
    // Create post as before, now with mediaUrls
    const post = await Post.create({
      author: req.body.author,
      organisation: req.body.organisation,
      content: req.body.content,
      mediaUrls: mediaUrls
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({message: error?.message});
  }
});

//delete
router.delete("/:id",getPost,async(req,res)=>{
try {
    await res.post.deleteOne();
    res.json({message:"Deleted"})
} catch (error) {
        res.status(500).json({message:error?.message})
    
}
})


async function getPost(req,res,next) {
  console.log("enter to post")
    let post
    try {
        post =await Post.findById(req.params.id)
        if(post == null){
            return res.status(401).json({message:"cant not find post"})
        }
    } catch (error) {
        res.status(500).json({message:error?.message})
        
    }
    res.post=post
    next()
}
module.exports =router