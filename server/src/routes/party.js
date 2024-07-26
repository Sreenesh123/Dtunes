import express from 'express'
const partyrouter = express.Router();
import partyModel from '../models/partyModel.js';
import Playlist from '../models/playlistModel.js';
import { User } from '../models/User.js';

partyrouter.post("/create", async (req, res) => {
  try {
    console.log("entered create")
    const { name, createdBy } = req.body;
    console.log(name,createdBy)
    const newParty = new partyModel({ name, createdBy, playlists: [] });
    console.log(newParty)
    await newParty.save();
    res.status(201).json(newParty);
  } catch (error) {
    res.status(500).json({ message: "Error creating party", error });
  }
});

partyrouter.get("/", async (req, res) => {
  try {
    const parties = await partyModel.find().populate("playlists");
    console.log(parties)
    res.status(200).json(parties);
  } catch (error) {
    res.status(500).json({ message: "Error fetching parties", error });
  }
});

partyrouter.post("/:partyId/join", async (req, res) => {
  const { partyId } = req.params;
  const { email } = req.body;

  try {
    const party = await partyModel.findById(partyId);
    if (!party) {
      return res.status(404).json({ message: "Party not found" });
    }
    if (!party.participants.includes(email)) {
      party.participants.push(email);
      await party.save();
    }

    res.status(200).json(party);
  } catch (error) {
    console.error("Error joining party:", error);
    res.status(500).json({ message: "Failed to join party", error });
  }
});

partyrouter.post("/remove/:id" ,async(req,res)=>
{
  console.log("pranesh entered")
  const {id}=req.params;
  const reqparty=await partyModel.findOneAndDelete(id)
  console.log(reqparty)
 
  // res.json({message:"deleted successfully"})
})


partyrouter.post("/:partyId/add-playlist", async (req, res) => {
  const { partyId } = req.params;
  const { playlistId } = req.body;
  const {email}=req.body

  try {
    const party = await partyModel.findById(partyId);
    if (!party) {
      return res.status(404).json({ message: "Party not found" });
    }
    
    if (!party.participants.includes(email)) {
      return res
        .status(403)
        .json({ message: "User is not a participant of the party" });
    }

    const user= await User.findOne({email})
    console.log("the required user is ::::::::::::::::::::::::::::::::::::::::::",user)
    const reqplaylist=user.playlists.find((playlist)=>playlist.id===playlistId)
    console.log(
      "the required playlist is ::::::::::::::::::::::::::::::::::::::::::",
      reqplaylist
    );

    party.playlists.push(reqplaylist);
    await party.save();

    res.status(200).json(party);
  } catch (error) {
    console.error("Error adding playlist to party:", error);
    res.status(500).json({ message: "Failed to add playlist to party", error });
  }
});

partyrouter.get("/:partyId", async (req, res) => {
  try {
    const { partyId } = req.params;
    const party = await partyModel.findById(partyId).populate("playlists");
    if (!party) {
      return res.status(404).json({ message: "Party not found" });
    }
    res.status(200).json(party);
  } catch (error) {
    res.status(500).json({ message: "Error fetching party", error });
  }
});
export default partyrouter
