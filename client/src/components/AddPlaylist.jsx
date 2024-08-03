import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { setClientToken } from "../spotify";
import { FaUpload, FaSearch, FaPlus, FaTimes } from "react-icons/fa";
import { PlayerContext } from "../context/PlayerContext";

axios.defaults.withCredentials = true;

const AddPlaylist = () => {
  const [image, setImage] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");  
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
const {
  isAuthenticated,
  setIsAuthenticated,
  loading,
  setLoading,
  email,
  setEmail,
  verifyUser,
} = useContext(PlayerContext);
  const navigate = useNavigate();


 

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("desc", desc);
      formData.append("image", image);
      formData.append("email",email);
      formData.append("tracks", JSON.stringify(selectedTracks));

      const response = await axios.post(
        "http://localhost:3000/api/playlist/add",
        formData
      );

      if (response.data.success) {
        toast.success("Playlist added");
        setDesc("");
        setImage(false);
        setName("");
        setSelectedTracks([]);
      } else {
        console.log(response)
        toast.error("Something went wrong");
      }
    } catch (error) {
      console.error("Error occurred:", error);
      toast.error("Error Occurred");
    } finally {
      setLoading(false);
    }
  };

  const onSearchHandler = async (term) => {
    if (term) {
      try {
     const response = await axios.get(
       `http://localhost:3000/auth/spotify/search?q=${encodeURIComponent(
         term
       )}&type=track`
     );

        setSearchResults(response.data.tracks.items);
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearch(query);
    await onSearchHandler(query);
  };

  const onTrackSelect = (track) => {
    const trackExists = selectedTracks.some((t) => t.id === track.id);
    if (!trackExists) {
      const trackData = {
        id: track.id,
        name: track.name,
        image: track.album.images[0],
        duration: track.duration_ms,
        preview_url: track.preview_url,
        uri: track.uri,
        artist: track.artists ? track.artists[0].name : "Unknown",
      };
      setSelectedTracks((prevTracks) => [...prevTracks, trackData]);
      toast.success(`Track added: ${track.name}`);
    } else {
      toast.info(`Track ${track.name} is already selected`);
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center min-h-[80vh] bg-gray-900">
        <div className="w-16 h-16 border-4 border-gray-600 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8 animate-fadeIn">
      <form onSubmit={onSubmitHandler} className="max-w-2xl space-y-8">
        <div className="space-y-4 animate-slideInUp">
          <p className="text-xl font-semibold">Upload Image</p>
          <input
            onChange={(e) => setImage(e.target.files[0])}
            type="file"
            id="image"
            accept="image/*"
            hidden
          />
          <label htmlFor="image" className="cursor-pointer block">
            <div className="w-32 h-32 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden transition duration-300 transform hover:scale-105">
              {image ? (
                <img
                  className="w-full h-full object-cover"
                  src={URL.createObjectURL(image)}
                  alt="Playlist cover"
                />
              ) : (
                <FaUpload className="text-4xl text-gray-400" />
              )}
            </div>
          </label>
        </div>

        <div className="space-y-2 animate-slideInUp">
          <p className="text-xl font-semibold">Playlist Name</p>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg p-3 focus:outline-none focus:border-green-500 transition duration-300"
            type="text"
            placeholder="Enter playlist name"
          />
        </div>

        <div className="space-y-2 animate-slideInUp">
          <p className="text-xl font-semibold">Playlist Description</p>
          <textarea
            onChange={(e) => setDesc(e.target.value)}
            value={desc}
            className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg p-3 focus:outline-none focus:border-green-500 transition duration-300 h-24 resize-none"
            placeholder="Describe your playlist"
          ></textarea>
        </div>

        <div className="space-y-2 animate-slideInUp">
          <p className="text-xl font-semibold">Search Songs</p>
          <div className="relative">
            <input
              onChange={handleSearchChange}
              value={search}
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg p-3 pl-10 focus:outline-none focus:border-green-500 transition duration-300"
              type="text"
              placeholder="Search for a song"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-2 animate-slideInUp">
            <h2 className="text-xl font-semibold">Search Results:</h2>
            <ul className="space-y-2">
              {searchResults.map((track) => (
                <li
                  key={track.id}
                  className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition duration-300 transform hover:scale-102"
                  onClick={() => onTrackSelect(track)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{track.name}</p>
                      <p className="text-sm text-gray-400">
                        {track.artists.map((artist) => artist.name).join(", ")}
                      </p>
                    </div>
                    <FaPlus className="text-green-500" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2 animate-slideInUp">
          <h2 className="text-xl font-semibold">Selected Tracks:</h2>
          <ul className="space-y-2">
            {selectedTracks.map((track) => (
              <li
                key={track.id}
                className="bg-gray-800 p-4 rounded-lg flex items-center justify-between animate-slideInLeft"
              >
                <div>
                  <p className="font-semibold">{track.name}</p>
                  <p className="text-sm text-gray-400">{track.artist}</p>
                </div>
                <button
                  onClick={() =>
                    setSelectedTracks(
                      selectedTracks.filter((t) => t.id !== track.id)
                    )
                  }
                  className="text-red-500 w-10 hover:text-red-600 transition duration-300"
                >
                  <FaTimes />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg text-lg font-semibold shadow-lg hover:bg-green-700 transition duration-300 transform hover:scale-105 active:scale-95 animate-slideInUp"
          type="submit"
        >
          Create Playlist
        </button>
      </form>
    </div>
  );
};

export default AddPlaylist;
