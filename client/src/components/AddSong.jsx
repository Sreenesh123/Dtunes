import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { assets } from "../assets/admin-assets/assets";
import { url } from "../App";
import { setClientToken } from "../spotify";
import { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { FaUpload, FaSearch, FaPlus, FaTimes, FaMusic } from "react-icons/fa";
import { BsMusicNoteList } from "react-icons/bs";

const AddSong = () => {
  const [image, setImage] = useState(null);
  const [song, setSong] = useState(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [album, setAlbum] = useState("none");
  const [albumData, setAlbumData] = useState([]);
  const [newAlbumData, setNewAlbumData] = useState(null);
  const {
    isAuthenticated,
    setIsAuthenticated,
    loading,
    setLoading,
    verifyUser,
    email,
  } = useContext(PlayerContext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("desc", desc);
      formData.append("image", image);
      formData.append("audio", song);
      formData.append("album", album);
      formData.append("email", email);

      const response = await axios.post(`${url}/api/song/add`, formData);
      if (response.data.success) {
        toast.success("Song added");
        setName("");
        setDesc("");
        setAlbum("none");
        setImage(null);
        setSong(null);
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      toast.error("Error occurred");
    }
    setLoading(false);
  };

  const loadAlbumData = async () => {
    try {
      const response = await axios.get(`${url}/api/album/list/${email}`);
      if (response.data.success) {
        setNewAlbumData(response.data.albums);
        setAlbumData(response.data.albums);
      } else {
        toast.error("Unable to load albums");
      }
    } catch (error) {
      toast.error("Error occurred");
    }
  };

  useEffect(() => {
    loadAlbumData();
  }, [email]);

  return loading ? (
    <div className="grid place-items-center min-h-[80vh]">
      <div className="w-16 h-16 place-self-center border-4 border-gray-400 border-t-green-800 rounded-full animate-spin"></div>
    </div>
  ) : (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <form onSubmit={onSubmitHandler} className="max-w-2xl space-y-8">
        <div className="flex gap-8">
          <div className="flex flex-col gap-4">
            <p className="text-xl font-semibold">Upload Song</p>
            <input
              onChange={(e) => setSong(e.target.files[0])}
              type="file"
              id="song"
              accept="audio/*"
              hidden
            />
            <label htmlFor="song" className="cursor-pointer block">
              <div className="w-32 h-32 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden transition duration-300 transform hover:scale-105">
                {song ? (
                  <FaMusic className="text-4xl text-green-500" />
                ) : (
                  <FaUpload className="text-4xl text-gray-400" />
                )}
              </div>
            </label>
          </div>
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
        </div>
        <div className="flex flex-col gap-2.5">
          <p>Song name</p>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg p-3 focus:outline-none focus:border-green-500 transition duration-300"
            placeholder="Type Here"
            type="text"
            required
          />
        </div>
        <div className="flex flex-col gap-2.5">
          <p>Song description</p>
          <textarea
            onChange={(e) => setDesc(e.target.value)}
            value={desc}
            className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg p-3 focus:outline-none focus:border-green-500 transition duration-300 h-24 resize-none"
            placeholder="Type Here"
            required
          ></textarea>
        </div>
        <div className="flex flex-col gap-2.5">
          <p>Album</p>
          <select
            onChange={(e) => setAlbum(e.target.value)}
            value={album}
            className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg p-3 focus:outline-none focus:border-green-500 transition duration-300"
          >
            <option value="none">Select an album</option>
            {albumData &&
              albumData.map((item, index) => (
                <option key={index} value={item.name}>
                  {item.name}
                </option>
              ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg text-lg font-semibold shadow-lg hover:bg-green-700 transition duration-300 transform hover:scale-105 active:scale-95"
        >
          ADD
        </button>
      </form>
    </div>
  );
};

export default AddSong;
