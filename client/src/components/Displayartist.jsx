import React, { useState, useEffect,useContext } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import AddAlbum from './AddAlbum';
import AddSong from './AddSong';
import ListSong from './ListSong';
import ListAlbum from './ListAlbum';
import Sidebar from './Sidebar2';
import Navbar from './Navbar2';
import { setClientToken } from '../spotify';
import { PlayerContext } from '../context/PlayerContext';

const Displayartist = () => {
  const navigate = useNavigate();
const {
  isAuthenticated,
  setIsAuthenticated,
  loading,
  setLoading,
  email,
  setEmail,
  verifyUser,
} = useContext(PlayerContext);

  return (
    <div className="flex flex-col items-start min-h-screen">
      <ToastContainer />
      <Sidebar />
      <div className="flex-1 h-screen w-full overflow-y-scroll bg-gradient-to-b from-gray-900 to-black">
        <Navbar />
        <div className="pt-8 pl-5 sm:pt-12 sm:pl-12">
          <Routes>
            <Route path="/add-song" element={<AddSong />} />
            <Route path="/add-album" element={<AddAlbum />} />
            <Route path="/list-song" element={<ListSong />} />
            <Route path="/list-album" element={<ListAlbum />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Displayartist;
