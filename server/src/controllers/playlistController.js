import { v2 as cloudinary } from "cloudinary";
import Playlist from "../models/playlistModel.js";
import {User} from "../models/User.js";

const addAlbum = async (req, res) => {
  let image="";
  try {
    console.log("entered here")
    console.log("this is req body",req.body);
    const name = req.body.name;
    
    const description = req.body.desc;
    const tracks=JSON.parse(req.body.tracks);
    console.log(tracks);
   
 if (req.body.image) {
   image = req.body.image;
 } else {
   const imageFile = req.file;
   const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
     resource_type: "image",
   });
   image = imageUpload.secure_url;
 }
    const playlistData = {
      name,
      description,
      tracks,
      image,
    };
console.log("this is playlistdata", playlistData)
    const playlist = new Playlist(playlistData);
    await playlist.save();
    console.log("printing")
    
      const email = req.body.email;
      const user = await User.findOne({email});
      
       user.playlists.push(playlist);
      await user.save();
    res.json({ success: true, message: "playlist added" });
  } catch (error) {
    console.log(error)
    res.json({ success: false });
  }


};

const listPlaylists = async (req, res) => {
  try {
console.log("entered fetching")
    
    const {email} = req.params;
    const user = await User.findOne({email});
    
    const likedsongs=user.likedsongs?user.likedsongs:[]
    const playlists = user.playlists;
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    console.log("playlists fetched")
    res.status(200).json({ success: true, playlists: playlists,likedsongs:likedsongs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
    
};

const ListTracks=async(req,res)=>
{
    try{
        const playlistid=req.params.playlistid
        const email = req.params.email;
        const user = await User.findOne({ email });
        if(user){
        const playlist = user.playlists.find(
          (pl) => pl._id.toString() === playlistid
        );
        const tracks=playlist.tracks;
         res.status(200).json({ success: true, tracks: tracks });
      }
    }catch(error)    {
        console.log(error)
    }
}

const deleteplaylist=async(req,res)=>
{console.log("entering eliminate")
    try {
      const user = await User.findOne({ email: req.params.email });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      const playlist = user.playlists.findOne({name:"Liked Songs"});
      if (!playlist) {
        return res
          .status(404)
          .json({ success: false, message: "Playlist not found" });
      }
      playlist.remove();
      await user.save();
      res.json({ success: true, message: "Playlist deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
}

const checkPlaylist = async (req, res) => {
  console.log("entered checking playlist")
  const { playlistId } = req.params;
  const { email } = req.query;
  try {
    const user = await User.findOne({ email: email });
    console.log(user)
    if (user) {
      const playlistExists = user.playlists.some(
        (playlist) => playlist.id === playlistId
      );
      res.json({ exists: playlistExists });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking playlist existence:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


const addsongtoplaylist = async (req, res) => {
  const { selectedPlaylist, email } = req.params;
  const clickedtrackData= req.body;
  console.log("this is the trackdata:::::::",clickedtrackData)

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const playlist = user.playlists.find(
      (playlist) => playlist._id.toString() === selectedPlaylist
    );

    if (!playlist) {
      return res
        .status(404)
        .json({ success: false, message: "Playlist not found." });
    }

    playlist.tracks.push(clickedtrackData);
    await user.save();
    res.json({
      success: true,
      message: "Song added to playlist successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};


// const removeAlbum = async (req, res) => {
//   try {
//     await albumModel.findByIdAndDelete(req.body.id);
//     res.json({ success: true, message: "album deleted" });
//   } catch (error) {
//     res.json({ succes: false });
//   }
// };

export { addAlbum,listPlaylists,ListTracks,deleteplaylist,checkPlaylist,addsongtoplaylist};
