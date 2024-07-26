import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/frontend-assets/assets";
import { PlayerContext } from "../context/PlayerContext";
import axios from "axios";
import { setClientToken } from "../spotify";
import {
  FaHeart as HeartFilled,
  FaRegHeart as HeartEmpty,
  FaMusic as MusicIcon,
  FaPlus as AddToPlaylistIcon,
} from "react-icons/fa";

const Player = () => {
  const {
    seekBar,
    seekBg,
    playStatus,
    play,
    pause,
    Track,
    time,
    setTime,
    next,
    liked,
    setLiked,
    previous,
    seekSong,
    selectedTrackData,
    likedSongs,
    setLikedSongs,
  } = useContext(PlayerContext);

  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [lyrics, setLyrics] = useState("");
  const [showLyrics, setShowLyrics] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const [showPlaylists, setShowPlaylists] = useState(false);
  

  useEffect(() => {
   
    if (token) {
      console.log("Retrieved token:", token);
      setClientToken(token);
      fetchPlaylists();
    } else {
      console.error("No token found.");
      return;
    }
  }, [token]);

  const trackData = selectedTrackData || Track;
 

  useEffect(() => {
    if (trackData && email) {
      checkIfLiked();
      updateCurrentPlayingTrack();
    }
  }, [trackData, email]);

  useEffect(() => {
    fetchLikedSongs();
  }, [email]);

  const fetchLikedSongs = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/like/list/${email}`
      );
      setLikedSongs(response.data.likedSongs);
    } catch (error) {
      console.error("Error fetching liked songs:", error);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/playlist/list/${email}`
      );
      console.log(response.data.playlists);
      setPlaylists(response.data.playlists);
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  };

  useEffect(() => {
    fetchPlaylists(email);
  }, [email]);

  const checkIfLiked = () => {
    const isLiked = likedSongs.some((song) => song.id === trackData.id);
    setLiked(isLiked);
  };

  const updateCurrentPlayingTrack = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/song/updateCurrentTrack",
        {
          email: email,
          track: {
            id: trackData.id,
            name: trackData.name,
            image: trackData.image
              ? trackData.image.url
                ? trackData.image.url
                : trackData.image
              : trackData.album.images[0].url,
            desc: trackData.desc,
          },
        }
      );

      console.log(
        "Updated current playing track:",
        response.data.currentPlayingTrack
      );
    } catch (error) {
      console.error("Error updating current playing track:", error);
    }
  };

  const clearCurrentPlayingTrack = async () => {
    try {
      await axios.post("http://localhost:3000/api/song/updateCurrentTrack", {
        email: email,
        track: {},
      });
      console.log("Current playing track cleared.");
    } catch (error) {
      console.error("Error clearing current playing track:", error);
    }
  };

  const fetchLyrics = async () => {
    if (!trackData) return;
    const artist = trackData.artists
      ? trackData.artists[0].name
      : trackData.artist;
    const title = trackData.name;

    try {
      console.log(artist);
      console.log(title);
      const response = await axios.get(
        `https://api.lyrics.ovh/v1/${artist}/${title}`
      );
      setLyrics(response.data.lyrics);
      setShowLyrics(true);
    } catch (error) {
      console.error("Error fetching lyrics:", error);
      setLyrics("Lyrics not found.");
      setShowLyrics(true);
    }
  };

  const closeLyrics = () => {
    setShowLyrics(false);
  };

  const handleAddToPlaylist = () => {
    setShowPlaylists(!showPlaylists);
  };

  const handlePause = () => {
    pause();
    clearCurrentPlayingTrack();
  };

  const handleAddTrackToPlaylist = async (newtrackData) => {
    console.log(newtrackData);
    const clickedtrackData = {
      id: newtrackData.id,
      name: newtrackData.name,
      image: newtrackData.album.images[0],
      duration: newtrackData.duration_ms,
      preview_url: newtrackData.preview_url,
      uri: newtrackData.uri,
      artist: newtrackData.artists ? newtrackData.artists[0].name : "Unknown",
    };
    console.log(clickedtrackData);
    if (!selectedPlaylist) {
      console.log("No playlist selected.");
      return;
    }
    try {
      const response = await axios.post(
        `http://localhost:3000/api/playlist/${selectedPlaylist}/${email}/add`,
        clickedtrackData
      );

      if (response.data.success) {
        console.log("Song added to playlist successfully!");
        setShowPlaylists(false);
      } else {
        console.log("Failed to add song to playlist.");
      }
    } catch (error) {
      console.error("Error adding song to playlist:", error);
    }
  };

  const handleLikeClick = async () => {
    try {
      if (!trackData.id) {
        console.log("No valid track to like.");
        return;
      }

      const isLiked = likedSongs.some((song) => song.uri?song.uri:"" === trackData.uri?trackData.uri:"none");

      if (liked) {
        const response = await axios.delete(
          `http://localhost:3000/api/like/remove/${trackData.uri}/${email}`
        );

        if (response.data.success) {
          setLiked(false);
          setLikedSongs(likedSongs.filter((song) => song.id !== trackData.id));
          console.log("Song disliked successfully!");
        } else {
          console.log("Failed to dislike the song.");
        }
      } else {
        const likedSong = {
          id: trackData.id,
          name: trackData.name,
          image: trackData.album.images[0],
          duration: trackData.duration_ms,
          preview_url: trackData.preview_url,
          uri: trackData.uri,
          artist: trackData.artists ? trackData.artists[0].name : "Unknown",
        };
        const response = await axios.post(
          `http://localhost:3000/api/like/add/${email}`,
          likedSong
        );

        if (response.data.success) {
          setLiked(true);
          setLikedSongs([...likedSongs, likedSong]);
          console.log("Song liked successfully!");
        } else {
          console.log("Failed to like the song.");
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return trackData ? (
    <div className="h-[10%] bg-black flex justify-between items-center text-white px-4">
      <div className="hidden lg:flex items-center gap-4">
        <img
          className="w-12"
          src={
            trackData.image
              ? trackData.image.url
                ? trackData.image.url
                : trackData.image
              : trackData.album.images[2].url
          }
          alt=""
        />
        <div className="flex flex-col">
          <p className="text-sm truncate w-36 overflow-hidden text-ellipsis">
            {trackData.name}
          </p>
          <p className="text-xs text-gray-400 truncate">
            {trackData.artists ? trackData.artists[0]?.name : ""}
          </p>
        </div>
        <button
          onClick={handleLikeClick}
          className="ml-4 text-white bg-transparent px-2 py-1 rounded"
        >
          {liked? (
            <HeartFilled color="red" />
          ) : (
            <HeartEmpty />
          )}
        </button>
      </div>
      <div className="flex flex-col items-center gap-1 m-auto">
        <div className="flex gap-4">
          <img
            onClick={() => previous(trackData.id)}
            className="w-4 cursor-pointer"
            src={assets.prev_icon}
            alt=""
          />
          {playStatus ? (
            <img
              onClick={handlePause}
              className="w-4 cursor-pointer"
              src={assets.pause_icon}
              alt=""
            />
          ) : (
            <img
              onClick={play}
              className="w-4 cursor-pointer"
              src={assets.play_icon}
              alt=""
            />
          )}
          <img
            onClick={() => {
              next(trackData.id);
            }}
            className="w-4 cursor-pointer"
            src={assets.next_icon}
            alt=""
          />
         
        </div>
        <div className="flex items-center gap-5">
          <p>
            {time.currentTime.minute}:
            {time.currentTime.second < 10
              ? "0" + time.currentTime.second
              : time.currentTime.second}
          </p>
          <div
            ref={seekBg}
            onClick={(e) => {
              seekSong(e);
            }}
            className="w-[60vw] max-w-[500px] bg-gray-300 rounded-full cursor-pointer"
          >
            <hr
              ref={seekBar}
              className="h-1 border-none w-0 bg-green-800 rounded-full"
            />
          </div>
          <p>
            {time.totalTime.minute}:
            {time.totalTime.second < 10
              ? "0" + time.totalTime.second
              : time.totalTime.second}
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <button
          onClick={fetchLyrics}
          className="ml-4 w-10 mr-7 text-white bg-transparent px-2 py-1 rounded"
        >
          <MusicIcon />
        </button>
        <div className="relative">
          <button
            onClick={handleAddToPlaylist}
            className="ml-4 text-white bg-transparent px-2 py-1 rounded"
          >
            <AddToPlaylistIcon />
          </button>
          {showPlaylists && (
            <div className="playlist-options">
              <select
                value={selectedPlaylist}
                onChange={(e) => setSelectedPlaylist(e.target.value)}
                className="text-black px-2 py-1 rounded"
              >
                <option value="">Select a playlist</option>
                {playlists.map((playlist) => (
                  <option key={playlist._id} value={playlist._id}>
                    {playlist.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleAddTrackToPlaylist(trackData)}
                className="ml-2 text-white bg-blue-500 px-2 py-1 rounded"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>
      {showLyrics && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg max-w-3xl max-h-[80vh] overflow-auto relative">
            <div className="flex flex-row justify-between mb-4 items-center">
              <h2 className="text-3xl font-semibold  border-b border-gray-700 pb-2">
                Lyrics
              </h2>
              <button
                onClick={closeLyrics}
                className=" text-gray-400 w-20 hover:text-gray-200 transition duration-300"
              >
                x
              </button>
            </div>

            <p className="whitespace-pre-wrap text-lg leading-relaxed">
              {lyrics}
            </p>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="h-[10%] bg-black flex justify-center items-center text-white">
      <p>Select a song to play</p>
    </div>
  );
};

export default Player;
