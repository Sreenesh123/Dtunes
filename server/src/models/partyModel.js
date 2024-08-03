import mongoose from "mongoose";
const { Schema } = mongoose;
import { playlistSchema } from "./playlistModel.js";
import { trackSchema } from "./playlistModel.js";

const partySchema = new Schema({
  name: { type: String, required: true },
  createdBy: { type: String, required: true },
  participants: { type: [String], default: [] },
  playlists: [playlistSchema],
  currentSong: {
    id: Schema.Types.ObjectId,
    title: String,
    audioUrl: String,
  }, 
});

const Party = mongoose.model("Party", partySchema);

export default Party;
