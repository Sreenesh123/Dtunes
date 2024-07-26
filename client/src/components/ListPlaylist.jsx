import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { PlayerContext } from "../context/PlayerContext";
import { setClientToken } from "../spotify";
import { useNavigate } from "react-router-dom";

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
  const [reqtime, setreqtime] = useState("");

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
      <div className="grid place-items-center min-h-[80vh]">
        <div className="w-16 h-16 place-self-center border-4 border-gray-400 border-t-green-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-white bg-gray-800 p-4">
        <p className="mb-4">Please log in to access this page.</p>
        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 w-[25%] bg-white text-black rounded-full"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <p className="text-2xl font-bold mb-4">
        {showLikedSongs ? "Liked Songs" : "Favourite Playlists..."}
      </p>
      {!showLikedSongs && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            className="relative bg-gradient-to-br from-purple-700 to-blue-500 text-white p-4 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300 ease-in-out cursor-pointer"
            onClick={handleLikedSongsClick}
          >
            <div className="h-40 flex items-center justify-center">
              <i className="fas fa-heart text-6xl"></i>
            </div>
            <div className="mt-2">
              <p className="text-lg font-semibold">Liked Songs</p>
            </div>
          </div>

          {data.map((item, index) => (
            <div key={item._id}>
              <div
                className="relative bg-gray-800 text-white p-4 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300 ease-in-out cursor-pointer"
                onClick={() => handlePlaylistClick(item._id, item.name)}
                style={{ transition: "transform 0.3s" }}
              >
                <img
                  className="w-full h-40 object-cover rounded-lg"
                  src={item.image}
                  alt={item.name}
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition duration-300 ease-in-out">
                  <p className="text-center px-4">{item.desc}</p>
                </div>
                <div className="mt-2">
                  <p className="text-lg font-semibold">{item.name}</p>
                </div>
              </div>
              <div>
                <button
                  onClick={() => playdjsongs(item)}
                  className="mt-2 bg-yellow-500 text-black px-4 py-2 rounded-full"
                >
                  DJ Mode
                </button>
                <button
                  onClick={() => playSequentially(item.tracks)}
                  className="mt-2 bg-white text-black px-4 py-2 rounded-full"
                >
                  Play All
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showLikedSongs && (
        <div>
          {userlikedsongs.map((song, index) => (
            <div
              onClick={() => {
                playTrack([song], song);
              }}
              key={index}
              className="bg-gray-800 text-white p-4 rounded-lg mb-2 flex items-center"
            >
              <img
                src={song.image.url}
                alt={song.name}
                className="w-16 h-16 object-cover rounded mr-4"
              />
              <div>
                <p className="text-lg font-semibold">{song.name}</p>
                <p className="text-sm">{song.artist}</p>
              </div>
            </div>
          ))}
          <button
            onClick={() => setShowLikedSongs(false)}
            className="mt-4 bg-white text-black px-4 py-2 rounded-full"
          >
            Back to Playlists
          </button>
        </div>
      )}
    </div>
  );
};

export default ListPlaylist;
