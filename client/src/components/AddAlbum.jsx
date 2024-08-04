import React, { useState, useEffect } from "react";
import { assets } from "../assets/admin-assets/assets";
import { url } from "../App";
import { toast } from "react-toastify";
import axios from "axios";
import { setClientToken } from "../spotify";
import { FaUpload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
const AddAlbum = () => {
  const [image, setImage] = useState(null);
  const [color, setColor] = useState("#ffffff");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [artistname,setartistName]=useState("")


  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("clicked");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("desc", desc);
      formData.append("image", image);
      formData.append("bgColor", color);
      formData.append("artist",artistname)
      formData.append("email", email);

      const response = await axios.post(`${url}/api/album/add`, formData);

      if (response.data.success) {
        console.log(response);
        toast.success("Album added");
        setDesc("");
        setImage(null);
        setName("");
      } else {
        console.log(response.data);
        toast.error("Something went wrong");
      }
    } catch (error) {
      console.log("this is the error:", error);
      toast.error("Error Occurred");
    }

    setLoading(false);
  };

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

  return loading ? (
    <div className="grid place-items-center min-h-[80vh] bg-gray-900">
      <div className="w-16 h-16 border-4 border-gray-600 border-t-green-500 rounded-full animate-spin"></div>
    </div>
  ) : (
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
                  alt="Album cover"
                />
              ) : (
                <FaUpload className="text-4xl text-gray-400" />
              )}
            </div>
          </label>
        </div>

        <div className="space-y-2 animate-slideInUp">
          <p className="text-xl font-semibold">Album Name</p>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg p-3 focus:outline-none focus:border-green-500 transition duration-300"
            type="text"
            placeholder="Enter album name"
          />
        </div>

        <div className="space-y-2 animate-slideInUp">
          <p className="text-xl font-semibold">Artist</p>
          <input
            onChange={(e) => setartistName(e.target.value)}
            value={artistname}
            className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg p-3 focus:outline-none focus:border-green-500 transition duration-300"
            type="text"
            placeholder="Enter album name"
          />
        </div>

        <div className="space-y-2 animate-slideInUp">
          <p className="text-xl font-semibold">Album Description</p>
          <textarea
            onChange={(e) => setDesc(e.target.value)}
            value={desc}
            className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg p-3 focus:outline-none focus:border-green-500 transition duration-300 h-24 resize-none"
            placeholder="Describe your album"
          ></textarea>
        </div>

        <button
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg text-lg font-semibold shadow-lg hover:bg-green-700 transition duration-300 transform hover:scale-105 active:scale-95 animate-slideInUp"
          type="submit"
        >
          Add Album
        </button>
      </form>
    </div>
  );
};

export default AddAlbum;
