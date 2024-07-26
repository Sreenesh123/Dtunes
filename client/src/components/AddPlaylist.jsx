import React, { useState, useEffect } from "react";
import { assets } from "../assets/admin-assets/assets";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { setClientToken } from "../spotify";
import apiClient from "../spotify";

const AddPlaylist = () => {
  const [image, setImage] = useState(false);
  const [color, setColor] = useState("#ffffff");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    console.log("clicked");
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("desc", desc);
      formData.append("image", image);
      formData.append("email", email);
      formData.append("tracks", JSON.stringify(selectedTracks));

      console.log(formData);
      const response = await axios.post(
        "http://localhost:3000/api/playlist/add",
        formData
      );

      if (response.data.success) {
        console.log("success");
        toast.success("Album added");
        setDesc("");
        setImage(false);
        setName("");
        setSelectedTracks([]);
      } else {
        console.log("fail");
        console.log(response);
        toast.error("Something went wrong");
      }
    } catch (error) {
      console.log("error");
      console.log(error);
      toast.error("Error Occurred");
    }

    setLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedEmail = localStorage.getItem("email");

    if (token && storedEmail) {
      console.log("Retrieved token:", token);
      setClientToken(token);
      setEmail(storedEmail);
      setIsAuthenticated(true);
    } else {
      console.error("No token or email found.");
      setIsAuthenticated(false);
    }
  }, []);

  const onSearchHandler = async (term) => {
    if (term) {
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
console.log(track)
    if (!trackExists) {
      const trackData = {
        id: track.id,
        name: track.name,
        image: track.album.images[0],
        duration: track.duration_ms,
        preview_url: track.preview_url,
        uri:track.uri,
        artist:track.artists?track.artists[0].name:"Unknown"

      };
      setSelectedTracks((prevTracks) => [...prevTracks, trackData]);
      toast.success(`Track added: ${track.name}`);
    } else {
      toast.info(`Track ${track.name} is already selected`);
    }
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

  return loading ? (
    <div className="grid place-items-center min-h-[80vh]">
      <div className="w-16 h-16 place-self-center border-4 border-gray-400 border-t-green-800 rounded-full animate-spin"></div>
    </div>
  ) : (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-start gap-8 text-white"
    >
      <div className="flex flex-col gap-4">
        <p>Upload Image</p>
        <input
          onChange={(e) => setImage(e.target.files[0])}
          type="file"
          id="image"
          accept="image/*"
          hidden
        />
        <label htmlFor="image">
          <img
            className="w-24 cursor-pointer"
            src={image ? URL.createObjectURL(image) : assets.upload_area}
            alt=""
          />
        </label>
      </div>

      <div className="flex flex-col gap-2.5">
        <p>Playlist name</p>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className="bg-transparent outline-green-600 border-2 border-gray-400 p-2.5 w-[max(40vw,250px)]"
          type="text"
          placeholder="Type Here"
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <p>Playlist Description</p>
        <input
          onChange={(e) => setDesc(e.target.value)}
          value={desc}
          className="bg-transparent outline-green-600 border-2 border-gray-400 p-2.5 w-[max(40vw,250px)]"
          type="text"
          placeholder="Type Here"
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <p>Search Song</p>
        <input
          onChange={handleSearchChange}
          value={search}
          className="bg-transparent outline-green-600 border-2 border-gray-400 p-2.5 w-[max(40vw,250px)]"
          type="text"
          placeholder="Search for a song"
        />
      </div>

      {searchResults.length > 0 && (
        <div className="search-results">
          <h2>Search Results:</h2>
          <ul>
            {searchResults.map((track) => (
              <li
                className="cursor-pointer text-white m-2 bg-gray-800 p-4 rounded-md"
                key={track.id}
                onClick={() => onTrackSelect(track)}
              >
                {track.name} by{" "}
                {track.artists.map((artist) => artist.name).join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        className="text-base bg-black text-white py-2.5 px-14 cursor-pointer"
        type="submit"
      >
        ADD
      </button>
    </form>
  );
};

export default AddPlaylist;
