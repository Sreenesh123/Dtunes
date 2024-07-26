import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { PlayerContext } from "../context/PlayerContext";
import { useLocation } from "react-router-dom";

const SearchSongs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userResults, setUserResults] = useState([]);
  const [searchType, setSearchType] = useState("songs");
  const [isPlaying, setIsPlaying] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [email, setEmail] = useState(localStorage.getItem("email"));
 

  const {
    setselectedTrackData,
    duration,
    setDuration,
    currentTime,
    setCurrentTime,
    embedController,
    setEmbedController,
    selectedTrack,
    setSelectedTrack,
    setLiked,
    likedSongs, setLikedSongs
  } = useContext(PlayerContext);
  const location = useLocation();

  useEffect(() => {
    setSearchResults([]);
    setUserResults([]);
    setSearchTerm("");
  }, [location]);

  useEffect(() => {
    const fetchFriendsList = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/users/friends/${email}`
        );
        setFriendsList(response.data.friends);
      } catch (error) {
        console.error("Error fetching friends list:", error);
      }
    };

    fetchFriendsList();
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

  const handleSearch = async (term) => {
    if (!term) {
      setSearchResults([]);
      setUserResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    if (searchType === "songs") {
      try {
        const response = await axios.get(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(
            term
          )}&type=track`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setSearchResults(response.data.tracks.items);
      } catch (error) {
        console.error("Error fetching search results:", error);
        setError("Error fetching search results. Please try again.");
      }
    } else if (searchType === "users") {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/users/search/${term}`
        );
        setUserResults([response.data]);
      } catch (error) {
        console.error("Error searching for users:", error);
        setError("Error searching for users. Please try again.");
      }
    }

    setLoading(false);
  };

  const handleInputChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    handleSearch(term);
  };

const handleTrackSelect = (track) => {
  const isLiked = likedSongs.some((song) => song.uri === track.uri);
  setLiked(isLiked);
  console.log("Track selected, isLiked:", isLiked);

  setSelectedTrack(track);
  setselectedTrackData({
    ...track,
    isLiked: isLiked, 
  });

  if (embedController) {
    embedController.loadUri(`spotify:track:${track.id}`);
  }
};

  const handleSendFriendRequest = async (receiverId) => {
    if (friendsList.some((friend) => friend === receiverId)) {
      alert("You are already friends with this user.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/users/send-request",
        {
          senderId: email,
          receiverId: receiverId,
        }
      );
      console.log("Friend request sent:", response.data);
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  return (
    <div className="w-full p-4">
      <div className="flex flex-row justify-evenly items-center">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Search for songs or users"
          className="bg-gray-800 w-1/7 text-white rounded-l-md py-2 px-4 outline-none placeholder-gray-500"
        />
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="bg-gray-800 w-40 text-white py-2 px-4 outline-none rounded-r-md"
        >
          <option value="songs">Songs</option>
          <option value="users">Users</option>
        </select>
      </div>

      {loading && <p className="mt-4 text-gray-400">Loading...</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}

      {searchType === "songs" && (
        <div className="mt-4">
          {searchResults.map((track) => (
            <div
              key={track.id}
              className="flex items-center mb-4 bg-gray-700 rounded-md p-4 cursor-pointer"
              onClick={() => handleTrackSelect(track)}
            >
              <img
                src={track.album.images[2]?.url}
                alt={track.name}
                className="w-16 h-16 rounded mr-4"
              />
              <div>
                <h3 className="text-white font-bold">{track.name}</h3>
                <p className="text-gray-400">
                  Artists:{" "}
                  {track.artists.map((artist) => artist.name).join(", ")}
                </p>
                <p className="text-gray-400">Album: {track.album.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {searchType === "users" && (
        <div>
          {userResults.map((user) => (
            <div
              key={user._id}
              className="flex items-center mb-4 bg-gray-700 rounded-md p-4"
            >
              <div>
                <h3 className="text-white font-bold">{user.username}</h3>
                {friendsList.some((friend) => friend === user.email) ? (
                  <button
                    disabled
                    className="bg-gray-500 text-white py-1 px-2 rounded-md mt-2"
                  >
                    Following
                  </button>
                ) : (
                  <button
                    onClick={() => handleSendFriendRequest(user.email)}
                    className="bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded-md mt-2"
                  >
                    Send Friend Request
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div id="embed-iframe" className="w-0 h-0 invisible hidden"></div>
    </div>
  );
};

export default SearchSongs;
