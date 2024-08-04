import mongoose from "mongoose";

export const trackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: {
    height:{type: Number},
    url: {type:String},
    width: {type:Number}
  },
  duration: Number,
  preview_url:{ type: String,},
  uri:{type:String},
  artist:{type:String}
});

export const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  desc: String,
  image: String,
  tracks: [trackSchema],
  
});

const Playlist = mongoose.model("Playlist", playlistSchema);

export default Playlist;
