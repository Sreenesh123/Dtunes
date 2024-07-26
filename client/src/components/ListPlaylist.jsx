import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { PlayerContext } from "../context/PlayerContext";
import { setClientToken } from "../spotify";
import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";

const ListPlaylist = () => {
  const {
    setselectedTrackData,
    setSelectedTrack,
    setLiked,
    embedController,
    likedSongs,
    setLikedSongs,
    setSongsData,
    songsData,
    time,
    Track,
    setTrack,
    playWithId,
  } = useContext(PlayerContext);

  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [data, setData] = useState([]);
  const [userlikedsongs, setLikedsongs] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [showLikedSongs, setShowLikedSongs] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  useEffect(() => {
    const reqtime = time;
    if (
      reqtime.currentTime.minute * 60 + reqtime.currentTime.second >=
        reqtime.totalTime.minute * 60 + reqtime.totalTime.second &&
      reqtime.currentTime.minute * 60 + reqtime.currentTime.second > 0 &&
      reqtime.totalTime.minute * 60 + reqtime.totalTime.second > 0
    ) {
      console.log("Song finished, moving to next");
      playSequentially(songsData, currentSongIndex + 1);
    }
  }, [time]);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      console.log("Retrieved token:", token);
      setClientToken(token);
      setIsAuthenticated(true);
    } else {
      console.error("No token found.");
      setIsAuthenticated(false);
    }
  }, []);

  const playdjsongs = async (playlist) => {
    const tracks = playlist.tracks;
    setSongsData(tracks);

    if (tracks.length > 0) {
      setselectedTrackData(tracks[0]);
      setCurrentSongIndex(0);
      console.log(tracks[0]);
      await playWithId(tracks[0]._id, tracks);
    } else {
      console.log("No tracks in the playlist");
    }
  };

  const playTrack = async (songs, song) => {
    console.log("Entered playTrack with song:", song);
    setTrack(song);

    const isLiked = likedSongs.some(
      (track) => (track.uri ? track.uri : "") === (song.uri ? song.uri : "none")
    );
    setLiked(isLiked);
    console.log("Track selected, isLiked:", isLiked);

    setSelectedTrack(song);
    setselectedTrackData({
      ...song,
      isLiked: isLiked,
    });

    if (embedController) {
      console.log("Loading URI in embed controller:", song.uri);
      await embedController.loadUri(song.uri);
      console.log("URI loaded, attempting to play");
      await embedController.play();
    } else {
      console.log("No embed controller available, using playWithId");
      await playWithId(song._id);
    }

    return new Promise((resolve) => {
      if (embedController) {
        embedController.addListener("playback_update", (e) => {
          console.log("Playback update:", e.data.position, e.data.duration);
          if (e.data.position >= e.data.duration) {
            console.log("Song finished, resolving promise");
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  };

  const playSequentially = async (songs, startIndex = 0) => {
    setSongsData(songs);
    console.log("Starting playback with songs:", songs);

    if (startIndex >= songs.length) {
      console.log("Reached end of playlist");
      return;
    }

    const song = songs[startIndex];
    console.log(`Playing song at index ${startIndex}:`, song);

    try {
      await playTrack(songs, song);
      setCurrentSongIndex(startIndex);
    } catch (error) {
      console.error("Error playing track:", error);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/playlist/list/${email}`
      );
      if (response.data.success) {
        setData(response.data.playlists);
      }
    } catch (error) {
      toast.error("Error occurred while fetching playlists.");
      console.error(error.message);
    }
  };

  const fetchLikedSongs = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/like/list/${email}`
      );
      if (response.data.success) {
        setLikedsongs(response.data.likedSongs);
      }
    } catch (error) {
      toast.error("Error occurred while fetching liked songs.");
      console.error(error.message);
    }
  };

  useEffect(() => {
    fetchPlaylists();
    fetchLikedSongs();
  }, [email]);

  const handlePlaylistClick = (playlistId, playlistname) => {
    navigate(`/playlist/display/${playlistId}/${playlistname}`);
  };

  const handleLikedSongsClick = () => {
    setShowLikedSongs(true);
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-16 h-16 border-4 border-gray-400 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <p className="text-lg mb-4">Please log in to access this page.</p>
        <button
          onClick={() => navigate("/login")}
          className="bg-yellow-500 text-gray-900 px-6 py-2 rounded-full hover:bg-yellow-400 transition"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <p className="text-3xl font-bold mb-6">
        {showLikedSongs ? "Liked Songs" : "Favorite Playlists"}
      </p>
      {!showLikedSongs ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div
            className="relative bg-gradient-to-br from-purple-700 to-blue-500 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer"
            onClick={handleLikedSongsClick}
          >
            <div className="h-24 flex items-center justify-center mb-4">
              <FaHeart className="text-5xl" />
            </div>
            <p className="text-3xl text-center font-semibold">Liked Songs</p>
          </div>
          {data.map((item) => (
            <div
              key={item._id}
              className="relative bg-gray-800 text-white p-3 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer"
            >
              <img
                className="w-full h-32 object-cover rounded-lg mb-2"
                src={item.image}
                alt={item.name}
              />
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 hover:opacity-100 transition duration-300 ease-in-out">
                <p className="text-center px-2">{item.desc}</p>
              </div>
              <p className="text-lg font-semibold">{item.name}</p>
              <button
                onClick={() => playdjsongs(item)}
                className="mt-2 bg-yellow-500 text-black px-3 py-1 rounded-full hover:bg-yellow-400 transition"
              >
                DJ Mode
              </button>
              <button
                onClick={() => playSequentially(item.tracks)}
                className="mt-2 bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-400 transition"
              >
                Play All
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {userlikedsongs.map((song, index) => (
            <div
              key={index}
              onClick={() => playTrack([song], song)}
              className="bg-gray-800 text-white p-3 rounded-lg mb-4 flex items-center cursor-pointer hover:bg-gray-700 transition"
            >
              <img
                src={song.image.url}
                alt={song.name}
                className="w-12 h-12 object-cover rounded mr-3"
              />
              <div>
                <p className="text-lg font-semibold">{song.name}</p>
                <p className="text-sm">{song.artist}</p>
              </div>
              <FaHeart className="ml-auto text-red-500" />
            </div>
          ))}
          <button
            onClick={() => setShowLikedSongs(false)}
            className="mt-6 bg-gray-700 text-white px-4 py-2 rounded-full hover:bg-gray-600 transition"
          >
            Back to Playlists
          </button>
        </div>
      )}
    </div>
  );
};

export default ListPlaylist;
