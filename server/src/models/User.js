import mongoose from "mongoose";
import { playlistSchema } from "./playlistModel.js";
import { likedsongSchema } from "./likedsongModel.js";
import { albumSchema } from "./albumModel.js";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  playlists: [playlistSchema],
  likedsongs: [likedsongSchema],
  albums: [albumSchema],
  friends: [{ type: String }],
  friendRequests: [
    {
      type: String,
      ref: "User",
    },
  ],
  currentPlayingTrack: {
    id: String,
    name: String,
    image: String,
    desc: String,
    artist: String,
  },
  friendsCurrentPlaying: [
    {
      username: String,
      track: {
        id: String,
        name: String,
        image: String,
        desc: String,
        artist: String,
      },
    },
  ],

  listeninghistory: [
    {
      track: {
        id: String,
        name: String,
        image: String,
        desc: String,
        artist: String,
      },
      createdAt:{type:String}
    },
  ],
});

const UserModel = mongoose.model("User", UserSchema);

export { UserModel as User };
