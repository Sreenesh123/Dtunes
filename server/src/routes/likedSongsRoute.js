import express from "express";
import {
  addLikedSong,
  removeLikedSong,
  checkLikedSong,
  fetchLikedSongs, 
} from "../controllers/likedsongControl.js";

const likerouter = express.Router();

likerouter.post("/like/add/:email", addLikedSong);
likerouter.delete("/like/remove/:uri/:email", removeLikedSong);
likerouter.get("/like/check/:id/:email", checkLikedSong);


likerouter.get("/like/list/:email", fetchLikedSongs);

export default likerouter;
