import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "../index.css";
import { assets } from "../assets/frontend-assets/assets";
import FriendsCurrentTracks from "./FriendsCurrentTracks";
import { FaBook, FaPlus } from "react-icons/fa";

const Sidebar = () => {
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = localStorage.getItem("token");
      const newEmail = localStorage.getItem("email");
      if (newToken !== token) {
        setToken(newToken);
      }
      if (newEmail !== email) {
        setEmail(newEmail);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [token, email]);

  return (
    <div className="w-[25%] h-full pl-4 pr-4 flex flex-col gap-4 text-white lg:flex bg-[#1a1a2e] shadow-lg">
      <div className="bg-[#111727] h-[15%] rounded-lg flex flex-col justify-center items-start p-4">
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-4 pl-2 cursor-pointer hover:bg-[#242424] p-2 rounded transition duration-300"
        >
          <img className="w-6" src={assets.home_icon} alt="Home Icon" />
          <p className="font-bold text-lg">Home</p>
        </div>
      </div>
      <div className="bg-[#111727] h- rounded-lg overflow-auto">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer hover:bg-[#242424] p-2 rounded transition duration-300">
            <FaBook className="w-8 h-8" />
            <p className="font-semibold text-lg">Library</p>
          </div>
        </div>
        <NavLink
          to="/add-playlist"
          className="p-4 bg-[#242424] m-2 rounded-lg font-semibold flex flex-col items-start justify-start gap-1 pl-4 hover:bg-[#333333] transition duration-300"
        >
          <button className="px-4 py-2 w-full bg-white text-[15px] text-black rounded-full mt-4 flex items-center gap-2 justify-center">
            Create Playlist
            <FaPlus />
          </button>
        </NavLink>

        <NavLink
          to="/list-artist"
          className="p-4 bg-[#242424] m-2 rounded-lg font-semibold flex flex-col items-start justify-start gap-1 pl-4 hover:bg-[#333333] transition duration-300"
        >
          <button className="px-4 py-2 w-full bg-white text-[15px] text-black rounded-full mt-4 flex items-center gap-2 justify-center">
            Artist
          </button>
        </NavLink>
        <NavLink
          to="/listening-stats"
          className="p-4 bg-[#242424] m-2 rounded-lg font-semibold flex flex-col items-start justify-start gap-1 pl-4 hover:bg-[#333333] transition duration-300"
        >
          <button className="px-4 py-2 w-full bg-white text-[15px] text-black rounded-full mt-4 flex items-center gap-2 justify-center">
            Stats
          </button>
        </NavLink>
        <NavLink
          to="/party"
          className="p-4 bg-[#242424] m-2 rounded-lg font-semibold flex flex-col items-start justify-start gap-1 pl-4 hover:bg-[#333333] transition duration-300"
        >
          <button className="px-4 py-2 w-full bg-white text-[15px] text-black rounded-full mt-4 flex items-center gap-2 justify-center">
            Party
          </button>
        </NavLink>
        <div className="overflow-auto p-4">
          <FriendsCurrentTracks email={email} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
