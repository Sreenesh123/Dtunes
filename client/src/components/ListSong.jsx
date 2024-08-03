import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { setClientToken } from "../spotify";
import apiClient from "../spotify";
import { url } from "../App";
import { PlayerContext } from "../context/PlayerContext";
import { useNavigate } from "react-router-dom"; 
import { FaSadTear } from "react-icons/fa";

const ListSong = () => {
  console.log("listing song");
  const [data, setData] = useState([]);

  const {
    email,
  } = useContext(PlayerContext);

  const navigate = useNavigate(); 

  const fetchSongs = async () => {
    if (!email) return;

    try {
      const response = await axios.get(`${url}/api/song/list/${email}`);
      if (response.data.success) {
        setData(response.data.tracks || []);
      } else {
        setData([]);
      }
    } catch (error) {
      toast.error("Error occurred while fetching songs");
      console.log(error);
      setData([]);
    }
  };

  const removeSong = async (id) => {
    try {
      const response = await axios.delete(
        `${url}/api/song/remove/${id}/${email}`
      );
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchSongs();
      }
    } catch (error) {
      toast.error("Error occurred while removing song");
      console.log(error);
    }
  };

  useEffect(() => {
    if (email) {
      fetchSongs();
    }
  }, [email]);

  const timeconvert = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    const modifiedseconds = seconds < 10 ? "0" + seconds : seconds;
    duration = `${minutes}:${modifiedseconds}`;
    return duration;
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-200 bg-gray-900">
        <FaSadTear className="text-6xl mb-4 text-blue-500" />
        <h1 className="text-2xl font-bold">Oops, no tracks found...</h1>
      </div>
    );
  }
 
  return (
    <div className="p-4 bg-gray-900 min-h-screen text-white">
      <p className="text-2xl font-bold mb-4">All Songs</p>
      <br />
      <div>
        <div className="sm:grid hidden grid-cols-[0.5fr_1fr_2fr_1fr_0.5fr] items-center gap-2.5 p-3 border border-gray-700 text-sm mr-5 bg-gray-800">
          <b>Image</b>
          <b>Name</b>
          <b>Album</b>
          <b>Duration</b>
          <b>Action</b>
        </div>
        {data && data.length > 0 ? (
          data.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_1fr_1fr] sm:grid-cols-[0.5fr_1fr_2fr_1fr_0.5fr] items-center gap-2.5 p-3 border border-gray-700 text-sm mr-5 bg-gray-800 transition duration-300 ease-in-out"
            >
              <img className="w-12" src={item.image} alt="" />
              <p>{item.name}</p>
              <p>{item.album}</p>
              <p>{timeconvert(item.duration)}</p>
              <p
                className="cursor-pointer text-red-500 hover:text-red-700 transition duration-300 ease-in-out"
                onClick={() => removeSong(item._id)}
              >
                x
              </p>
            </div>
          ))
        ) : (
          <p>No songs available</p>
        )}
      </div>
    </div>
  );
};

export default ListSong;
