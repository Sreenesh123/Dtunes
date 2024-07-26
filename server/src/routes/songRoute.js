import{addSong,listSong,removeSong,addCurrentPlayingSong,fetchCurrentPlayingSong} from "../controllers/songController.js"
import express from 'express'
import upload from "../middlewares/multer.js";
 const songRouter =express.Router()

 songRouter.post('/add',upload.fields([{name:'image',maxCount:1},{name:'audio',maxCount:1}]),addSong);
 songRouter.get('/list/:email',listSong);
songRouter.delete('/remove/:id/:email',removeSong)
songRouter.post("/updateCurrentTrack",addCurrentPlayingSong);
songRouter.get("/friendsCurrentTracks/:email", fetchCurrentPlayingSong);


 export default songRouter