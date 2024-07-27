import { v2 as cloudinary } from "cloudinary";
import songModel from "../models/songModel.js";
import { User } from "../models/User.js";
import axios from "axios"


const addSong = async (req, res) => {
  console.log("entered addsong");
  try {
    const { name, desc, album, email } = req.body;
    const audioFile = req.files.audio[0];
    const imageFile = req.files.image[0];
    const audioUpload = await cloudinary.uploader.upload(audioFile.path, {
      resource_type: "video",
    });
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    const duration = `${Math.floor(audioUpload.duration / 60)}:${Math.floor(
      audioUpload.duration % 60
    )}`;
    const user = await User.findOne({ email });

    const songData = {
      name,
      desc,
      album,
      image: imageUpload.secure_url,
      file: audioUpload.secure_url,
      duration,
    };
    console.log(songData);

    const reqalbum = user.albums.find(
      (searchalbum) => searchalbum.name === album
    );
    console.log(reqalbum);
    reqalbum.tracks.push(songData);
    await user.save();

    const song = songModel(songData);
    await song.save();
    res.json({ success: true, message: "song added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
};

const listSong = async (req, res) => {
  console.log("listing song");
  const { email } = req.params;
  console.log("email::::::::::::::::::::::::::", email);
  try {
    const user = await User.findOne({ email });
    if (user) {
      const allAlbums = user.albums;
      if (allAlbums) {
        const tracks = allAlbums.flatMap((album) => album.tracks);
        console.log("these are the tracks:", tracks);
        res.json({ success: true, tracks });
      } else {
        res.json({ success: true, tracks: [] });
      }
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
};

const removeSong = async (req, res) => {
  console.log("entered remove song");
  try {
    const { id, email } = req.params;

    console.log(id, email);

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let songAlbum = null;
    let songName = null;
    let songIndex = -1;
    for (const album of user.albums) {
      const index = album.tracks.findIndex(
        (track) => track._id.toString() === id
      );
      if (index !== -1) {
        songAlbum = album;
        songName = album.tracks[index].name;
        songIndex = index;
        break;
      }
    }

    if (songIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Song not found in user's albums" });
    }
    songAlbum.tracks.splice(songIndex, 1);
    await user.save();
    // await songModel.findByIdAndDelete(id);
    res.json({
      success: true,
      message: `Song '${songName}' removed from album '${songAlbum.name}'`,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
};
const addCurrentPlayingSong = async (req, res) => {
  console.log("hello",req.body)
  const { email,track,createdAt } = req.body;
  console.log("this is the required joke email:", email);
  console.log("track:", track);
  console.log(createdAt)

  try {
    const updateData = track
      ? { currentPlayingTrack: track }
      : { currentPlayingTrack: null };
    let user = await User.findOneAndUpdate({ email }, updateData, {
      new: true,
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const friendsUsernames = user.friends;
    for (const friendUsername of friendsUsernames) {
      const friend = await User.findOne({ username: friendUsername });
      if (friend) {
        friend.friendsCurrentPlaying = friend.friendsCurrentPlaying.filter(
          (entry) => entry.username !== user.username
        );
        console.log("friends sogs:",friend.friendsCurrentPlaying)

        if (track) {
          friend.friendsCurrentPlaying.push({
            username: user.username,
            track: track,
          });
        }

        await friend.save();
      }
    }

    res.status(200).json({
      success: true,
      currentPlayingTrack: user.currentPlayingTrack,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update current track." });
  }
};

const fetchCurrentPlayingSong = async (req, res) => {
  console.log("entered fetching");
  const { email } = req.params;
  console.log("fetching email:", email);

  try {
    const user = await User.findOne({ email });
    if (user) {
      const friendsUsernames = user.friends;
      console.log(friendsUsernames);
      const friendsDetails = await User.find({
        username: { $in: friendsUsernames },
      });
      const friendsCurrentTracks = friendsDetails.map((friend) => ({
        username: friend.username,
        currentPlayingTrack: friend.currentPlayingTrack,
      }));
      console.log(friendsCurrentTracks);

      res.status(200).json({ success: true, friendsCurrentTracks });
    } else {
      res.status(404).json({ success: false, error: "User not found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch friends' current tracks.",
    });
  }
};

const addlistenteninghistory = async (req, res) => {
  try {
    const { email, track,createdAt } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.listeninghistory.push({ track,createdAt });
    await user.save();

    res
      .status(201)
      .json({ message: "Listening history recorded successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error recording listening history", error });
  }
};

const fetchlisteninghistory=async (req, res) => {
  try {
    const { email } = req.params;
    const { period } = req.query;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const recentHistory = user.listeninghistory.filter(
      item => new Date(item.createdAt) >= startDate
    );

    const trackCounts = {};
    for (const record of recentHistory) {
      if (!trackCounts[record.track.id]) {
        trackCounts[record.track.id] = {
          track: record.track,
          count: 0,
        };
      }
      trackCounts[record.track.id].count++;
    }

    const stats = await Promise.all(
      Object.values(trackCounts).map(async (item) => {
        const genre = await fetchGenre(item.track.name, item.track.artist);
        return { ...item, genre };
      })
    );

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching listening stats', error });
  }
};

async function fetchGenre(trackName, artistName) {
  try {
    const response = await axios.get("https://itunes.apple.com/search", {
      params: {
        term: `${trackName} ${artistName}`,
        entity: "song",
        limit: 1,
      },
      
    });

    if (response.data.results.length > 0) {
      return response.data.results[0].primaryGenreName || "Unknown";
    } else {
      return "Unknown";
    }
  } catch (error) {
    console.error("Error fetching genre:", error);
    return "Unknown";
  }
}

const fetchrecommendations = async (req, res) => {
  console.log("entered fetchrecommendations")
  try {
    const { trackId, limit } = req.query;
    const recommendations = await spotifyApi.getRecommendations({
      seed_tracks: [trackId],
      limit: limit || 5,
    });

    const formattedRecommendations = recommendations.tracks.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      image: track.album.images[0].url,
      uri: track.uri,
    }));

    res.json(formattedRecommendations);
  } catch (error) {
    console.error("Error getting recommendations:", error);
    res.status(500).json({ error: "Failed to get recommendations" });
  }
};

export {
  addSong,
  listSong,
  removeSong,
  addCurrentPlayingSong,
  fetchCurrentPlayingSong,
  addlistenteninghistory,
  fetchlisteninghistory,
  fetchrecommendations
};
