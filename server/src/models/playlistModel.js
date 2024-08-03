import mongoose from "mongoose";
import { likedsongSchema } from "./likedsongModel.js";

const artistSchema = new mongoose.Schema({
  external_urls: mongoose.Schema.Types.Mixed, 
  href: String,
  id: String,
  name: String,
  type: String,
  uri: String,
});

const albumSchema = new mongoose.Schema({
  album_type: String,
  artists: [artistSchema],
  available_markets: [String],
  external_urls: mongoose.Schema.Types.Mixed, 
  href: String,
  id: String,
  images: [
    {
      height: Number,
      url: String,
      width: Number,
    },
  ],
});

export const trackSchema = new mongoose.Schema({
  // id: { type: String, required: true,sparse:true },
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
