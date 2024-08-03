import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
dotenv.config();
import { UserRouter } from "./src/routes/user.js";
import songRouter from "./src/routes/songRoute.js";
import connectDB from "./src/config/mongodb.js";
import connectCloudinary from "./src/config/cloudinary.js";
import albumRouter from "./src/routes/albumRoute.js";
import likerouter from "./src/routes/likedSongsRoute.js";
import playlistRouter from "./src/routes/playlistRoute.js";
import router from "./src/routes/friendrequest.js";
import partyrouter from "./src/routes/party.js";
import bodyParser from "body-parser";


const app = express();
app.use(express.json());
const port =process.env.PORT
connectDB();
connectCloudinary()
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true, 
};
app.use(
  cors(corsOptions)
);
app.use(cookieParser())



app.use("/auth", UserRouter);
app.use('/api/song',songRouter);
app.use('/api/album',albumRouter)
app.use('/api/playlist',playlistRouter)
app.use('/api',likerouter)
app.use('/api/users',router)
app.use("/api/parties",partyrouter)




app.listen(port, () => {
  console.log("Server is Running");
});
