const express =require("express")
const router =express.Router()
const User =require("../models/user")
const organisation = require("../models/organisation");
const authMiddleware = require("../utils/authmiddleware");
const Chat =require("../models/chat")
//get all
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const senderId = req.user._id;
    const { organisationId, recipientId, message } = req.body;

    // Validate presence of fields
    if (!organisationId || !recipientId || !message) {
      return res.status(400).json({ message: 'organisationId, recipientId and message are required' });
    }

    // Check both users belong to organisation
    const valid = await usersShareOrganisation(senderId, recipientId, organisationId);
    
    if (!valid) {
      return res.status(403).json({ message: 'Users do not share this organisation' });
    }

    // Create and save message
    const chatMessage = new Chat({
      organisation: organisationId,
      sender: senderId,
      recipient: recipientId,
      message
    });
    await chatMessage.save();

        const io = req.app.get("io");
    io.to(organisationId.toString()).emit("newMessage", {
      _id: chatMessage._id,
      organisation: chatMessage.organisation,
      sender: chatMessage.sender,
      recipient: chatMessage.recipient,
      message: chatMessage.message,
      createdAt: chatMessage.createdAt
    });

    // Emit real-time message event (if socket is connected, see below)

    res.status(201).json(chatMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/:organisationId/:userId', authMiddleware, async (req, res) => {
  try {
    const authUserId = req.user._id.toString();
    const { organisationId, userId } = req.params;

    // Check if both users share organisation
    const valid = await usersShareOrganisation(authUserId, userId, organisationId);
    if (!valid) {
      return res.status(403).json({ message: 'Users do not share this organisation' });
    }

    // Retrieve messages between authUser and userId in organisation
    const messages = await Chat.find({
      organisation: organisationId,
      $or: [
        { sender: authUserId, recipient: userId },
        { sender: userId, recipient: authUserId }
      ]
    })
      .sort({ createdAt: 1 }) // oldest first
      .populate('sender', 'username avatarUrl')     // optional: include sender details
      .populate('recipient', 'username avatarUrl'); // optional: include recipient details

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// GET /conversations/:organisationId
router.get('/conversations/:organisationId', authMiddleware, async (req, res) => {
  try {
    const authUserId = req.user._id.toString();
    const { organisationId } = req.params;

    // 1. Find all messages for this user in this organisation (as sender or recipient)
    const messages = await Chat.aggregate([
      {
        $match: {
          organisation: organisationId,
          $or: [
            { sender: req.user._id },
            { recipient: req.user._id }
          ]
        }
      },
      // 2. For each conversation pair, determine the conversation partner
      {
        $addFields: {
          interactionWith: {
            $cond: [
              { $eq: ["$sender", req.user._id] }, "$recipient", "$sender"
            ]
          }
        }
      },
      // 3. Sort to get most recent message first (for $group)
      { $sort: { createdAt: -1 } },
      // 4. Group by "interactionWith", take the latest message per contact
      {
        $group: {
          _id: "$interactionWith",
          latestMessage: { $first: "$$ROOT" }
        }
      },
      // 5. Lookup user details for interactionWith
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "interactionWithUser"
        }
      },
      { $unwind: "$interactionWithUser" },
      // 6. Optional: limit to latest n conversations
      { $sort: { "latestMessage.createdAt": -1 } }
    ]);

    // Format data
    const conversations = messages.map(conv => ({
      user: {
        _id: conv.interactionWithUser._id,
        username: conv.interactionWithUser.username,
        avatarUrl: conv.interactionWithUser.avatarUrl,
      },
      latestMessage: {
        _id: conv.latestMessage._id,
        sender: conv.latestMessage.sender,
        recipient: conv.latestMessage.recipient,
        message: conv.latestMessage.message,
        createdAt: conv.latestMessage.createdAt,
      }
    }));

    res.json(conversations);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


async function usersShareOrganisation(senderId, recipientId, organisationId) {
  const [sender, recipient] = await Promise.all([
    User.findById(senderId).select('organisations'),
    User.findById(recipientId).select('organisations')
  ]);

  if (!sender || !recipient) return false;

  const senderOrgs = sender.organisations.map(id => id.toString());
  const recipientOrgs = recipient.organisations.map(id => id.toString());
  const orgIdStr = organisationId.toString();

  return senderOrgs.includes(orgIdStr) && recipientOrgs.includes(orgIdStr);
}
module.exports =router