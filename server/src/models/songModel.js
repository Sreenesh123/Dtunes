import mongoose from 'mongoose'

export const songSchema=new mongoose.Schema({name:{type:String,required:true},
desc:{type:String,required:true},
album:{type:String, required:true},
image:{type:String,required:true},
file:{type:String,required:true},
duration:{type:Number,required:true},
uri:{type:String}}
)

const songModel=mongoose.models.song || mongoose .model("song",songSchema)

export default songModel