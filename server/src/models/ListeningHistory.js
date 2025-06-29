import mongoose from "mongoose";

const ListeningHistorySchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  track_id: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now },
});

const ListeningHistory = mongoose.model(
  "ListeningHistory",
  ListeningHistorySchema
);
export default ListeningHistory;
