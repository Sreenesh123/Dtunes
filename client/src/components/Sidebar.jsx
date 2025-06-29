
import React, { useState, useEffect,useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { useNavigate, NavLink } from "react-router-dom";
import "../index.css";
import FriendsCurrentTracks from "./FriendsCurrentTracks";
import {
  FaHome,
  FaSearch,
  FaMusic,
  FaChartBar,
  FaUsers,
  FaPlusCircle,
} from "react-icons/fa";

const Sidebar = () => {

  console.log("sidebar")

  const {
    isAuthenticated,
    setIsAuthenticated,
    loading,
    setLoading,
    email,
    setEmail,
    verifyUser,spotifyToken
  } = useContext(PlayerContext);

  const [token, setToken] = (spotifyToken || "");
  const navigate = useNavigate();

  const NavItem = ({ to, icon: Icon, text }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center p-3 rounded-lg transition duration-300
       hover:bg-gradient-to-r from-gray-700 to-gray-600 text-white`
      }
    >
      <Icon className="w-6 h-6 mr-3" />
      <span className="font-medium">{text}</span>
    </NavLink>
  );

  return (
    <div className="w-[25%] h-[99%] mt-2 mr-3 rounded-lg bg-gray-900 text-white flex flex-col">
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-6 text-center">MusicApp</h1>
        <nav className="space-y-2">
          <NavItem to="/" icon={FaHome} text="Home" />
          <NavItem to="/Search" icon={FaSearch} text="Discover" />
          <NavItem to="/list-artist" icon={FaMusic} text="Artists" />
          <NavItem to="/listening-stats" icon={FaChartBar} text="Insights" />
          <NavItem to="/party" icon={FaUsers} text="Social" />
          
        </nav>
      </div>

      <div className="mt-auto p-5">
        <button
          onClick={() => navigate("/add-playlist")}
          className="w-full bg-gradient-to-r from-gray-800 to-gray-700 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center hover:from-gray-700 hover:to-gray-600 transition duration-300"
        >
          <FaPlusCircle className="mr-2" />
          New Playlist
        </button>
      </div>

      <div className="p-5 overflow-auto bg-gray-800 rounded-t-lg">
        <div className="overflow-auto max-h-48">
          <FriendsCurrentTracks email={email} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;