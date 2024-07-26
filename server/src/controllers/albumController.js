import {v2 as cloudinary} from 'cloudinary'
import albumModel from '../models/albumModel.js'
import { User } from '../models/User.js'

const addAlbum =async(req,res)=>
{
    console.log("entering adding")
    try{
        const name=req.body.name;
        const desc=req.body.desc;
        const bgColor=req.body.bgColor;
        const imageFile=req.file;
        const imageUpload=await cloudinary.uploader.upload(imageFile.path,{resource_type:'image'});
        const albumData=
        {
            name,desc,bgColor,image:imageUpload.secure_url
        }
         const email = req.body.email;
         const user = await User.findOne({ email });
         
        const album=albumModel(albumData);
        album.save();
        user.albums.push(album);
        await user.save()
        console.log("adding album")
        console.log("this is the album:", album)
        await album.save()
        res.json({success:true,message:"album added"})
    }catch(error)
    {
        console.log(error)
        res.json({success:false})
    }

}

const getAlbumSongs = async (req, res) => {
  const { id, email } = req.params;
  
  try {
    const user = await User.findOne({ email });

    if (user) {
      const reqalbum = user.albums.find((album) => album._id.toString() === id);
      if (reqalbum) {
        const reqTracks = reqalbum.tracks;
        console.log("these are the fetched joe tracks", reqTracks);
        return res.json({ success: true, message: "tracks fetched", tracks: reqTracks });
      } else {
        return res.status(404).json({ success: false, message: "Album not found" });
      }
    } else {
      return res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};





const listAlbum= async(req,res)=>
{
    const {email}= req.params
    try{
        const user = await User.findOne({ email });
        if(user){
        const allAlbums=user.albums
        console.log("these are the album:",allAlbums)
        res.json({success:true,albums:allAlbums});
        }

    }
    catch(error)
    {
        console.log(error)
        res.json({success:false})

    }
}

const removeAlbum = async (req, res) => {
    console.log("entered remove")
  try {
    const {id} = req.params;
    const {email}=req.params
    
    console.log(id,email)
   


      const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    user.albums = user.albums.filter(
      (album) => album._id.toString() !== id
    );
    await user.save();

    await albumModel.findByIdAndDelete(id);

    res.json({ success: true, message: "Album deleted" });
  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
};

export {addAlbum,removeAlbum,listAlbum,getAlbumSongs}