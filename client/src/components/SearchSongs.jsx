import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { PlayerContext } from "../context/PlayerContext";
import { useLocation } from "react-router-dom";

const SearchSongs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [userResults, setUserResults] = useState([]);
  const [searchType, setSearchType] = useState("songs");
  const [isPlaying, setIsPlaying] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [userSavedSongs, setUserSavedSongs] = useState([]);

  const searchContainerRef = useRef(null);

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
    setSongsData,
    setLiked,
    likedSongs,
    setLikedSongs,
    playWithId,
    songsData,
    isAuthenticated,
    setIsAuthenticated,
    loading,
    setLoading,
    email,
    setEmail,
    verifyUser,
    spotifyToken
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
    fetchSongs();
  }, [email]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const fetchSongs = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/song/allsongs`
      );
      if (response.data.success) {
        setUserSavedSongs(response.data.tracks || []);
      } else {
        setUserSavedSongs([]);
      }
    } catch (error) {
      console.error("Error occurred while fetching songs:", error);
      setUserSavedSongs([]);
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
          `http://localhost:3000/auth/spotify/search?q=${encodeURIComponent(
            term
          )}&type=track`
        );

          const spotifyTracks = response.data.tracks.items;

        const filteredUserSongs = userSavedSongs.filter(
          (song) =>
            song.name.toLowerCase().includes(term.toLowerCase())
           
        );
        const combinedResults = [...spotifyTracks, ...filteredUserSongs];

        setSearchResults(combinedResults);
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
    setShowResults(true);
  };

  const playTrack = (track) => {
    console.log(track);
    setSongsData([track]);
    setselectedTrackData(track);
    setSelectedTrack(track);
    playWithId(track._id, [track]);
  };

  const handleTrackSelect = async (trackData) => {
    const isUserSavedSong = !trackData.uri;
    const isLiked = isUserSavedSong
      ? likedSongs.some((song) => song._id === trackData._id)
      : likedSongs.some((song) => song.uri === trackData.uri);
    setLiked(isLiked);
    console.log("Track selected, isLiked:", isLiked);

   
    console.log(trackData);

    setselectedTrackData({
      ...trackData,
      isLiked: isLiked,
    });
console.log(isUserSavedSong)
    if(!isUserSavedSong)
    {
       setSelectedTrack(trackData);
    }

    if (isUserSavedSong) {
      playTrack(trackData);
    } else if (embedController) {     
      embedController.loadUri(trackData.uri);      
    }

    try {
      const track = {
        id: trackData.id,
        name: trackData.name,
        image: trackData.image || trackData.album?.images[0]?.url || "",
        desc: trackData.album?.name || trackData.desc,
        artist: trackData.artists
          ? trackData.artists[0].name
          : trackData.artist,
      };

      await axios.post("http://localhost:3000/api/song/listening-history", {
        email,
        track,
        createdAt: new Date().toISOString(),
      });
      console.log("Listening history recorded successfully");
    } catch (error) {
      console.error("Error recording listening history:", error);
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
    <div className="w-full pt-4 px-6 relative" ref={searchContainerRef}>
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 flex items-center space-x-4">
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              placeholder="Search for songs or users"
              className="flex-grow bg-gray-700 text-white rounded-full py-2 px-4 outline-none placeholder-gray-400 focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="bg-gray-700 text-white py-2 px-4 outline-none rounded-md focus:ring-2 focus:ring-blue-500 transition duration-300"
            >
              <option value="songs">Songs</option>
              <option value="users">Users</option>
            </select>
          </div>
        </div>

        {showResults &&
          (loading ||
            error ||
            searchResults.length > 0 ||
            userResults.length > 0) && (
            <div className="absolute left-0 right-0 mt-2 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-10">
              {loading && (
                <p className="text-center py-4 text-gray-400">Loading...</p>
              )}
              {error && (
                <p className="text-center py-4 text-red-500 font-semibold">
                  {error}
                </p>
              )}

              <div className="max-h-[60vh] overflow-y-auto">
                {searchType === "songs" && (
                  <div className="space-y-4 p-4">
                    {searchResults.map((track) => (
                      <div
                        key={track.id || track._id}
                        className="flex items-center bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition duration-300"
                        onClick={() => handleTrackSelect(track)}
                      >
                        <img
                          src={track.image || track.album?.images[2]?.url}
                          alt={track.name}
                          className="w-16 h-16 rounded-md mr-4 object-cover"
                        />
                        <div>
                          <h3 className="text-white font-bold text-lg mb-1">
                            {track.name}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {track.artists
                              ? track.artists
                                  .map((artist) => artist.name)
                                  .join(", ")
                              : track.artist}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            {track.album?.name || track.desc}
                          </p>
                          {track.user && (
                            <p className="text-gray-400 text-xs mt-1">
                              Uploaded by: {track.user.username}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchType === "users" && (
                  <div className="space-y-4 p-4">
                    {userResults.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center justify-between bg-gray-700 rounded-lg p-4"
                      >
                        <h3 className="text-white font-bold text-lg">
                          {user.username}
                        </h3>
                        {friendsList.some((friend) => friend === user.email) ? (
                          <button
                            disabled
                            className="bg-gray-500 text-white py-2 px-4 rounded-md opacity-50 cursor-not-allowed"
                          >
                            Following
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSendFriendRequest(user.email)}
                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-300"
                          >
                            Send Friend Request
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default SearchSongs;
