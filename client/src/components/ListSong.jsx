import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { setClientToken } from "../spotify";
import apiClient from "../spotify";
import { url } from "../App";

const ListSong = () => {
  console.log("listing song");
  const [data, setData] = useState([]);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchUserEmail = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        console.log("Retrieved token:", token);
        setClientToken(token);

        try {
          const response = await apiClient.get("me");
          console.log(response);
          setEmail(response.data.email);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        console.error("No token found.");
      }
    };

    fetchUserEmail();
  }, []);

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

  return (
    <div className="p-4">
      <p className="text-2xl font-bold mb-4">All Songs</p>
      <br />
      <div>
        <div className="sm:grid hidden grid-cols-[0.5fr_1fr_2fr_1fr_0.5fr] items-center gap-2.5 p-3 border border-gray-300 text-sm mr-5 bg-gray-100">
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
              className="grid grid-cols-[1fr_1fr_1fr] sm:grid-cols-[0.5fr_1fr_2fr_1fr_0.5fr] items-center gap-2.5 p-3 border border-gray-300 text-sm mr-5 transition duration-300 ease-in-out"
            >
              <img className="w-12" src={item.image} alt="" />
              <p>{item.name}</p>
              <p>{item.album}</p>
              <p>{item.duration}</p>
              <p
                className="cursor-pointer text-red-600 hover:text-red-800 transition duration-300 ease-in-out"
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
