import express from "express";
import {
  addAlbum,listPlaylists,ListTracks,deleteplaylist,checkPlaylist,addsongtoplaylist
 
} from "../controllers/playlistController.js";
import upload from "../middlewares/multer.js";

const playlistRouter = express.Router();

playlistRouter.post("/add", upload.single("image"), addAlbum);
playlistRouter.post("/addplaylist",addAlbum);
playlistRouter.get("/list/:email", listPlaylists);
playlistRouter.get('/:email/:playlistid',ListTracks)
playlistRouter.delete('/delete/:email',deleteplaylist)
playlistRouter.get('/check/:playlistId',checkPlaylist)
playlistRouter.post('/:selectedPlaylist/:email/add',addsongtoplaylist)


// playlistRouter.post("/remove", removeAlbum);

export default playlistRouter;
