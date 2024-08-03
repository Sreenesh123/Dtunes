import express from 'express'
import { addAlbum,listAlbum,removeAlbum } from '../controllers/albumController.js'
import upload from '../middlewares/multer.js'
import albumModel from '../models/albumModel.js'
import { getAlbumSongs } from '../controllers/albumController.js'

const albumRouter=express.Router()

albumRouter.post("/add",upload.single('image'),addAlbum);
albumRouter.get('/list/:email',listAlbum);
albumRouter.delete('/remove/:id/:email',removeAlbum);
albumRouter.get('/albumsongs/:id/:email',getAlbumSongs)

export default albumRouter