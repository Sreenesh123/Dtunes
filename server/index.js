

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
import { verifyUser } from "./src/middlewares/Verifyuser.js";
import { createServer } from "http";
import { Server } from "socket.io";


const app = express();
app.use(express.json());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    credentials: true,
  },
});
const port = process.env.PORT;
connectDB();
connectCloudinary();
const corsOptions = {
  origin: ["http://localhost:5173", "*"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(cookieParser());


const partyRooms = new Map();


io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("joinParty", (partyId, username) => {
    console.log(`${username} joining party ${partyId}`);
    socket.join(`party-${partyId}`);

    if (!partyRooms.has(partyId)) {
      partyRooms.set(partyId, {
        currentTrack: null,
        isPlaying: false,
        position: 0,
        lastUpdate: Date.now(),
        seekBarColor: "from-indigo-500 to-purple-500", 
      });
    }


    const partyState = partyRooms.get(partyId);
    if (partyState.isPlaying && partyState.currentTrack) {
      const elapsed = (Date.now() - partyState.lastUpdate) / 1000;
      partyState.position += elapsed;
      partyState.lastUpdate = Date.now();
    }

    socket.emit("partyState", partyState);
  });


  socket.on("playTrack", (partyId, track) => {
    console.log(`Play track in party ${partyId}:`, track.name);

    const partyState = partyRooms.get(partyId) || {
      isPlaying: true,
      position: 0,
      lastUpdate: Date.now(),
      seekBarColor: "from-indigo-500 to-purple-500",
    };

    partyState.currentTrack = track;
    partyState.isPlaying = true;
    partyState.position = 0;
    partyState.lastUpdate = Date.now();

    partyRooms.set(partyId, partyState);

    io.to(`party-${partyId}`).emit("trackChange", track);
    io.to(`party-${partyId}`).emit("playbackState", {
      isPlaying: true,
      position: 0,
      seekBarColor: partyState.seekBarColor,
    });
  });

  socket.on("playbackControl", (partyId, { isPlaying, position }) => {
    console.log(
      `Playback control in party ${partyId}:`,
      isPlaying ? "play" : "pause",
      "at position",
      position
    );

    const partyState = partyRooms.get(partyId);
    if (!partyState) {
      console.warn(
        `Party ${partyId} not found when updating playback state. Initializing a default state.`
      );
      partyRooms.set(partyId, {
        currentTrack: null,
        isPlaying: isPlaying,
        position: position !== undefined ? position : 0, 
        lastUpdate: Date.now(),
        seekBarColor: "from-indigo-500 to-purple-500", 
      });

      const newPartyState = partyRooms.get(partyId);
      io.to(`party-${partyId}`).emit("playbackState", {
        isPlaying: newPartyState.isPlaying,
        position: newPartyState.position,
      });
      return;
    }

    partyState.isPlaying = isPlaying;

    if (position !== undefined) {
      partyState.position = position;
    }
 
    partyState.lastUpdate = Date.now();
    partyRooms.set(partyId, partyState);
    io.to(`party-${partyId}`).emit("playbackState", {
      isPlaying: partyState.isPlaying,
      position: partyState.position, 
    });
  });
 

  socket.on("seekPosition", (partyId, position) => {
    console.log(`Seek in party ${partyId} to position:`, position);

    const partyState = partyRooms.get(partyId);
    if (!partyState) return;

    partyState.position = position;
    partyState.lastUpdate = Date.now();

    partyRooms.set(partyId, partyState);
    io.to(`party-${partyId}`).emit("seekUpdate", position);
  });
  

  socket.on("updateSeekBarColor", (partyId, colorGradient) => {
    const partyState = partyRooms.get(partyId);
    if (!partyState) return;

    partyState.seekBarColor = colorGradient;
    partyRooms.set(partyId, partyState);

    io.to(`party-${partyId}`).emit("seekBarColorUpdate", colorGradient);
  });

  socket.on("syncRequest", (partyId) => {
    const partyState = partyRooms.get(partyId);
    if (!partyState) return;
    let currentPosition = partyState.position;
    if (partyState.isPlaying) {
      const elapsed = (Date.now() - partyState.lastUpdate) / 1000;
      currentPosition += elapsed;
    }

    socket.emit("syncResponse", {
      isPlaying: partyState.isPlaying,
      position: currentPosition,
      currentTrack: partyState.currentTrack,
      seekBarColor: partyState.seekBarColor,
    });
  });
  socket.on("leaveParty", (partyId) => {
    console.log(`Client leaving party ${partyId}`);
    socket.leave(`party-${partyId}`);
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use("/auth", UserRouter);
app.use("/api/song", songRouter);
app.use("/api/album", albumRouter);
app.use("/api/playlist", playlistRouter);
app.use("/api", likerouter);
app.use("/api/users", router);
app.use("/api/parties", partyrouter);

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
