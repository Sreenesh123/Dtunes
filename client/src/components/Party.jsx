import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { setClientToken } from "../spotify";
import { AudioPlayerContext } from "../context/AudioPlayerContext";

const Party = () => {
  const {
    setselectedTrackData,
    setPlayStatus,
    playStatus,
    time,
    setTime,
    seekBar,
    liked,
    setLiked,
  } = useContext(PlayerContext);

  const { playTrack } = useContext(AudioPlayerContext);
  const { partyId } = useParams();
  const [party, setParty] = useState({ playlists: [] });
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
   const {
     
     embedController,
     setEmbedController,
     selectedTrack,
     setSelectedTrack,
   } = useContext(PlayerContext);
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [isPartyCreator, setIsPartyCreator] = useState(false);
  const [spotifyEmbedUrl, setSpotifyEmbedUrl] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setClientToken(token);
    }
  }, []);

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
    console.log(track)
    setSelectedTrack(track);
  };

  const handlePlayTrack = () => {
    if (isPartyCreator) {
      if (selectedTrack) {
        setselectedTrackData(selectedTrack);
        setPlayStatus(true);
      }
    } else {
      console.log("Only the party creator can play tracks.");
    }
  };

  return (
    <div className="w-full p-4">
      {party ? (
        <div>
          <h2 className="text-white text-xl mb-4">{party.name}</h2>
          <p className="text-gray-400 mb-4">Created by: {party.createdBy}</p>
          {party.participants && party.participants.includes(email) ? (
            <>
              <h3 className="text-white text-lg mb-2">Playlists:</h3>
              <ul className="mb-4">
                {party.playlists.map((playlist) => (
                  <li
                    key={playlist._id}
                    className="text-gray-400 cursor-pointer"
                    onClick={() => handlePlaylistClick(playlist)}
                  >
                    {playlist.name}
                  </li>
                ))}
              </ul>
              {selectedPlaylist && (
                <div>
                  <h3 className="text-white text-lg mb-2">Tracks:</h3>
                  <ul className="mb-4">
                    {selectedPlaylist.tracks.map((track) => (
                      <li
                        key={track.id}
                        className="text-gray-400 cursor-pointer"
                        onClick={() => handleTrackClick(track)}
                      >
                        {track.name}
                      </li>
                    ))}
                  </ul>
                  {selectedTrack && (
                    <div>
                      <button
                        onClick={handlePlayTrack}
                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md outline-none"
                      >
                        Play Track
                      </button>
                    </div>
                  )}
                </div>
              )}
              <select
                value={selectedPlaylistId}
                onChange={(e) => setSelectedPlaylistId(e.target.value)}
                className="bg-gray-800 text-white py-2 px-4 rounded-md outline-none mb-4"
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
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md outline-none"
              >
                Add Playlist to Party
              </button>
            </>
          ) : (
            <button
              onClick={handleJoinParty}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md outline-none"
            >
              Join Party
            </button>
          )}
        </div>
      ) : (
        <p className="text-gray-400">Loading...</p>
      )}
    </div>
  );
};

export default Party;
