import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { setClientToken } from "../spotify";
import { AudioPlayerContext } from "../context/AudioPlayerContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import socketService from "../services/socketService";

const Party = () => {
  const {
    setselectedTrackData,
    setPlayStatus,
    embedController,
    selectedTrack,
    setSelectedTrack,
    email,
    time,
    setTime,
    playStatus,
    play,
    pause,
    seekSong,
    seekBg,
    seekBar,
  } = useContext(PlayerContext);

  const navigate = useNavigate();
  const { partyId } = useParams();
  const [party, setParty] = useState({ playlists: [] });
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [isPartyCreator, setIsPartyCreator] = useState(false);
  const [isPartyMode, setIsPartyMode] = useState(false);
  const [syncStatus, setSyncStatus] = useState("Not connected");
  const [currentTrack, setCurrentTrack] = useState(null);
  const lastPositionRef = useRef(0);

  useEffect(() => {
    if (email) {
      socketService.connect();
      socketService
        .on("partyState", handlePartyState)
        .on("trackChange", handleTrackChange)
        .on("playbackState", handlePlaybackState)
        .on("seekUpdate", handleSeekUpdate)
        .on("syncResponse", handleSyncResponse)
        .on("error", (errorMsg) => {
          toast.error(errorMsg);
        });

      socketService.joinParty(partyId, email);
      setIsPartyMode(true);
      setSyncStatus("Connected");

      return () => {
        socketService.leaveParty();
        setIsPartyMode(false);
        setSyncStatus("Disconnected");
      };
    }
  }, [email, partyId]);

  useEffect(() => {
    fetchParty();
    fetchPlaylists(email);
  }, [email]);

  const fetchParty = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/parties/${partyId}`
      );
      setParty(response.data);
      setIsPartyCreator(response.data.createdBy === email);
    } catch (error) {
      console.error("Error fetching party:", error);
    }
  };

  const handlePartyState = (state) => {
    console.log("Received initial party state:", state);

    if (state.currentTrack) {
      setCurrentTrack(state.currentTrack);
      if (!isPartyCreator) {
        setSelectedTrack(state.currentTrack);
        setselectedTrackData(state.currentTrack);

        if (embedController && state.currentTrack.uri) {
          embedController.loadUri(state.currentTrack.uri);

          setTimeout(() => {
            embedController.seek(state.position);

            if (state.isPlaying) {
              embedController.play();
              setPlayStatus(true);
            } else {
              embedController.pause();
              setPlayStatus(false);
            }
          }, 1000);
        }
      }
    }
  };

  const handleTrackChange = (track) => {
    console.log("Track changed to:", track);
    setCurrentTrack(track);

    if (!isPartyCreator) {
      setSelectedTrack(track);
      setselectedTrackData(track);

      if (embedController && track.uri) {
        embedController.loadUri(track.uri);
        embedController.play();
        setPlayStatus(true);
      }
    }
  };

  const handlePlaybackState = (state) => {
    console.log("Playback state update:", state);

    if (!isPartyCreator && embedController) {
      if (typeof state.position === "number") {
        embedController.seek(state.position);
        lastPositionRef.current = state.position;
      }

      if (state.isPlaying && !playStatus) {
        embedController.play();
        setPlayStatus(true);
      } else if (!state.isPlaying && playStatus) {
        embedController.pause();
        setPlayStatus(false);
      }
    }
  };

  const handleSeekUpdate = (position) => {
    console.log("Seek update to position:", position);

    if (!isPartyCreator && embedController) {
      embedController.seek(position);
      lastPositionRef.current = position;
    }
  };

  const handleSyncResponse = (state) => {
    console.log("Sync response:", state);

    if (!isPartyCreator && embedController) {
      if (Math.abs(lastPositionRef.current - state.position) > 2) {
        embedController.seek(state.position);
        lastPositionRef.current = state.position;
      }

      if (state.isPlaying !== playStatus) {
        if (state.isPlaying) {
          embedController.play();
          setPlayStatus(true);
        } else {
          embedController.pause();
          setPlayStatus(false);
        }
      }
    }
  };

  const fetchPlaylists = async (email) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/playlist/list/${email}`
      );
      setPlaylists(response.data.playlists);
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  };

  const handleJoinParty = async () => {
    try {
      await axios.post(`http://localhost:3000/api/parties/${partyId}/join`, {
        email,
      });
      await fetchParty();
      fetchPlaylists(email);
    } catch (error) {
      console.error("Error joining party:", error);
    }
  };

  const handleAddPlaylistToParty = async () => {
    try {
      await axios.post(
        `http://localhost:3000/api/parties/${partyId}/add-playlist`,
        { playlistId: selectedPlaylistId, email }
      );
      await fetchParty();
    } catch (error) {
      console.error("Error adding playlist to party:", error);
    }
  };

  const handlePlaylistClick = (playlist) => {
    setSelectedPlaylist(playlist);
    setSelectedTrack(null);
  };

  const handleTrackClick = (track) => {
    if (isPartyCreator) {
      console.log(track);
      setSelectedTrack(track);
      console.log("entered");
    } else {
      toast.error("Only the party creator can play tracks.");
    }
  };
  const handlePlayTrack = () => {
    if (isPartyCreator) {
      if (selectedTrack) {
        setselectedTrackData(selectedTrack);
        setCurrentTrack(selectedTrack);

        if (embedController && selectedTrack.uri) {
          embedController.loadUri(selectedTrack.uri);
          embedController.play();
          setPlayStatus(true);

          socketService.playTrack(selectedTrack);
        } else {
          toast.warning(
            "This track cannot be played in party mode (no URI found)"
          );
        }
      }
    } else {
      toast.error("Only the party creator can play tracks.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handlePartyPlayPause = () => {
    if (embedController) {
      const currentTimeInSeconds =
        time.currentTime.minute * 60 + time.currentTime.second;

      if (playStatus) {
        embedController.pause();
        setPlayStatus(false);
        socketService.controlPlayback(false, currentTimeInSeconds);
      } else {
        embedController.play();
        setPlayStatus(true); 
        socketService.controlPlayback(true, currentTimeInSeconds);
      }
    }
  };

  const handlePartySeek = (e) => {
    if (embedController && currentTrack && seekBg.current) {
      const totalDurationInSeconds =
        time.totalTime.minute * 60 + time.totalTime.second;

      if (totalDurationInSeconds > 0) {
        const newPositionInSeconds =
          (e.nativeEvent.offsetX / seekBg.current.offsetWidth) *
          totalDurationInSeconds;
        seekSong(e);
        socketService.seekToPosition(newPositionInSeconds);
        lastPositionRef.current = newPositionInSeconds;
      }
    }
  };

  const handleLeaveParty = () => {
    socketService.leaveParty();
    setIsPartyMode(false);
    navigate("/party");
  };
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen text-white p-8">
      <ToastContainer />
      {party ? (
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                {party.name}
              </h2>
              <p className="text-xl text-gray-300">
                Created by: {party.createdBy}
              </p>
            </div>{" "}
            <div className="flex flex-col items-end sm:flex-row sm:items-center">
              <div className="flex items-center bg-gray-900 px-3 py-1 rounded-md mr-3 mb-2 sm:mb-0">
                <span
                  className={`h-3 w-3 rounded-full mr-2 ${
                    syncStatus === "Connected"
                      ? "animate-pulse bg-green-500"
                      : "bg-red-500"
                  }`}
                ></span>
                <span className="text-sm">{syncStatus}</span>
              </div>
              <button
                onClick={handleLeaveParty}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Leave Party
              </button>
            </div>
          </div>

          {currentTrack && (
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg mt-6 mb-8">
              <div className="flex flex-col md:flex-row items-center mb-4">
                {currentTrack.album &&
                currentTrack.album.images &&
                currentTrack.album.images[0] ? (
                  <img
                    src={currentTrack.album.images[0].url}
                    alt={currentTrack.name}
                    className="w-32 h-32 object-cover rounded-lg shadow-lg mr-6"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-700 rounded-lg shadow-lg mr-6 flex items-center justify-center">
                    <span>No Image</span>
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold">{currentTrack.name}</h3>
                  <p className="text-gray-400">
                    {currentTrack.artist ||
                      (currentTrack.artists && currentTrack.artists[0].name)}
                  </p>
                  <div className="mt-3 flex items-center">
                    <button
                      onClick={handlePartyPlayPause}
                      className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white py-2 px-6 rounded-full"
                    >
                      {playStatus ? "Pause" : "Play"}
                    </button>
                    <div className="ml-4 text-sm">
                      <span>
                        {time.currentTime.minute}:
                        {time.currentTime.second < 10 ? "0" : ""}
                        {time.currentTime.second}
                      </span>
                      <span> / </span>
                      <span>
                        {time.totalTime.minute}:
                        {time.totalTime.second < 10 ? "0" : ""}
                        {time.totalTime.second}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="relative h-4 bg-gray-700 rounded-full cursor-pointer"
                onClick={handlePartySeek}
                ref={seekBg}
              >
                <div
                  className="absolute h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  ref={seekBar}
                ></div>
              </div>
            </div>
          )}

          {party.participants && party.participants.includes(email) ? (
            <div className="space-y-12">
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-2xl font-semibold mb-4 text-purple-300">
                  Party Playlists
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {party.playlists.map((playlist) => (
                    <li
                      key={playlist._id}
                      className="bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition duration-300 transform hover:scale-105"
                      onClick={() => handlePlaylistClick(playlist)}
                    >
                      <span className="font-medium">{playlist.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {selectedPlaylist && (
                <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h3 className="text-2xl font-semibold mb-4 text-purple-300">
                    Tracks
                  </h3>
                  <ul className="space-y-2 max-h-96 overflow-y-auto pr-4 custom-scrollbar">
                    {selectedPlaylist.tracks.map((track) => (
                      <li
                        key={track._id}
                        className={`p-3 rounded-md cursor-pointer transition duration-300 flex items-center ${
                          selectedTrack && selectedTrack._id === track._id
                            ? "bg-gradient-to-r from-green-600 to-green-700"
                            : "bg-gray-700 hover:bg-gray-600"
                        }`}
                        onClick={() => handleTrackClick(track)}
                      >
                        <span className="flex-grow">{track.name}</span>
                        {selectedTrack && selectedTrack._id === track._id && (
                          <span className="ml-2 text-green-300">▶</span>
                        )}
                      </li>
                    ))}
                  </ul>
                  {selectedTrack && (
                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={handlePlayTrack}
                        className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white py-3 px-8 rounded-full font-semibold transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400"
                      >
                        Play Track
                      </button>
                    </div>
                  )}
                </div>
              )}
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-2xl font-semibold mb-4 text-purple-300">
                  Add Playlist to Party
                </h3>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <select
                    value={selectedPlaylistId}
                    onChange={(e) => setSelectedPlaylistId(e.target.value)}
                    className="bg-gray-700 text-white py-2 px-4 rounded-md outline-none flex-grow focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="">Select a playlist</option>
                    {playlists.map((playlist) => (
                      <option key={playlist._id} value={playlist._id}>
                        {playlist.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddPlaylistToParty}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 px-6 rounded-md font-semibold transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400"
                  >
                    Add Playlist
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={handleJoinParty}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-8 rounded-full font-semibold text-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
            >
              Join Party
            </button>
          )}
        </div>
      ) : (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}
      <div id="embed-iframe" className="w-0 h-0 invisible hidden"></div>
    </div>
  );
};

export default Party;
