import React, { useState, useEffect,useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";

const ListAlbum = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
const {
  isAuthenticated,
  loading,
  setLoading,
  email,
  setEmail,
  verifyUser,
} = useContext(PlayerContext);

  const fetchAlbums = async () => {
    if (!email) return;
    try {
      const response = await axios.get(
        `http://localhost:3000/api/album/list/${email}`
      );
      if (response.data.success) {
        setData(response.data.albums);
      }
    } catch (error) {
      console.error("Error occurred while fetching albums:", error.message);
    }
  };

  const removeAlbum = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:3000/api/album/remove/${id}/${email}`
      );
      if (response.data.success) {
        console.log(response.data.message);
        fetchAlbums();
      }
    } catch (error) {
      console.error("Error occurred while removing album:", error.message);
    }
  };

  const handleAlbumClick = (id,image,name) => {
    navigate(`/album/albumsongs/${id}/${name}`);
  };

  useEffect(() => {
    fetchAlbums();
  }, [email]);


 if (loading) {
   return (
     <div className="flex items-center justify-center min-h-screen bg-gray-900">
       <div className="w-16 h-16 border-4 border-gray-400 border-t-green-500 rounded-full animate-spin"></div>
     </div>
   );
 }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-200">
      <h1 className="text-2xl font-bold mb-4">All Albums</h1>
      <div className="overflow-x-auto">
        <div className="hidden sm:grid grid-cols-[0.5fr_1fr_2fr_1fr_0.5fr] items-center gap-4 p-3 border-b border-gray-700 text-sm bg-gray-800">
          <span className="font-semibold">Image</span>
          <span className="font-semibold">Name</span>
          <span className="font-semibold">Description</span>          
          <span className="font-semibold text-right ">Action</span>
        </div>
        <div>
          {data.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_1fr_1fr] sm:grid-cols-[0.5fr_1fr_2fr_1fr_0.5fr] items-center gap-4 p-3 border-b border-gray-700 text-sm bg-gray-800 hover:bg-gray-700 transition-colors"
              onClick={() => handleAlbumClick(item._id,item.image,item.name)}
            >
              <img
                className="w-12 h-12 object-cover rounded-md shadow-md"
                src={item.image}
                alt={item.name}
              />
              <p className="font-medium">{item.name}</p>
              <p>{item.desc}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeAlbum(item._id);
                }}
                className="text-gray-50 hover:text-red-300 font-semibold cursor-pointer text-right focus:outline-none focus:ring-0 w-3 ml-48"
              >
                X
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListAlbum;
