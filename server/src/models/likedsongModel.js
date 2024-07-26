import mongoose from "mongoose";

export const likedsongSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: {
    height: { type: Number },
    url: { type: String },
    width: { type: Number },
  },
  duration: Number,
  preview_url: { type: String },
  uri: { type: String },
  artist: { type: String },
});

const Song = mongoose.model("LikedSong", likedsongSchema);

export default Song;
