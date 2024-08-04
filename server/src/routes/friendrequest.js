import express from "express";
const router = express.Router();
import { User } from "../models/User.js";


router.get("/search/:searchterm", async (req, res) => {
  const { searchterm } = req.params;
  try {
    const users = await User.findOne({
      username: { $regex: searchterm, $options: "i" },
    }).select("username email");
console.log("this is the required user",users)
    res.json(users);
  } catch (error) {
    console.error("Error searching for users:", error);
    res.status(500).json({ error: "Error searching for users" });
  }
});

router.get("/friend-requests/:email", async(req,res)=>
{
    const {email}=req.params;
   
    const user = await User.findOne({email})

    const friendrequests=user?user.friendRequests:"";
    
    if(friendrequests)
    {try{
        return res.json({
          success: true,
          friendrequests:friendrequests,
        });}
        catch(error)
        {
            console.log(error)
        }
    }

})

router.post("/send-request", async (req, res) => {
  const { senderId, receiverId } = req.body;
  console.log("sending request",senderId,receiverId)

  try {
    const sender = await User.findOne({email:senderId});
    const receiver = await User.findOne({email:receiverId});
    console.log(receiver,sender)

    if (!sender || !receiver) {
      return res.status(404).json({ error: "User not found" });
    }
    receiver.friendRequests.push(sender.username);
    await receiver.save();

    res.json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ error: "Error sending friend request" });
  }
});


router.post("/accept-friend-request", async (req, res) => {
  const { userEmail, friendEmail } = req.body;
  console.log("useremail:",userEmail,"senderemail",friendEmail)

  try {
    const currentUser = await User.findOneAndUpdate(
      { email: userEmail },
      {
        $addToSet: { friends: friendEmail },
        $pull: { friendRequests: friendEmail },
      },
      { new: true }
    ); 
    await currentUser.save(); 
      const friendUser = await User.findOneAndUpdate(
        { username: friendEmail },
        {
          $addToSet: { friends: currentUser.username },
        },
        { new: true }
      );
      await friendUser.save(); 

    res.status(200).json({ message: "Friend request accepted successfully" });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/decline-friend-request", async (req, res) => {
  const { userEmail, friendEmail } = req.body;

  try {
    const currentUser = await User.findOneAndUpdate(
      { email: userEmail },
      { $pull: { friendRequests: { username: friendEmail } } },
      { new: true }
    );

    res.status(200).json({ message: "Friend request declined successfully" });
  } catch (error) {
    console.error("Error declining friend request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/friends/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const user = await User.findOne({ email });
    const friends = user.friends;
    console.log(friends);
    res.json({ success: true, friends: friends });
  } catch (error) {
    console.log(error);
  }
});
export default router;
