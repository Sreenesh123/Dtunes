import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { setClientToken } from "../spotify";
import { AudioPlayerContext } from "../context/AudioPlayerContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Party = () => {
  const {
    setselectedTrackData,
    setPlayStatus,
    embedController,
    selectedTrack,
    setSelectedTrack,
    email,
  } = useContext(PlayerContext);
  
  const { partyId } = useParams();
  const [party, setParty] = useState({ playlists: [] });
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);  
  const [isPartyCreator, setIsPartyCreator] = useState(false);

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
          if (embedController) {
            embedController.loadUri(track.uri);
            embedController.play();
          } 
        // setSelectedTrack(selectedTrack)
        setPlayStatus(true);
      }
    } 
    else {
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

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen text-white p-8">
      <ToastContainer />
      {party ? (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            {party.name}
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Created by: {party.createdBy}
          </p>
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