import React, { useState, useEffect } from 'react';
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

const Displayartist = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      console.log("Retrieved token:", token);
      setClientToken(token);
      setIsAuthenticated(true);
    } else {
      console.error("No token found.");
      setIsAuthenticated(false);
    }
  }, []);

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

  return (
    <div className="flex flex-col items-start min-h-screen">
      <ToastContainer />
      <Sidebar />
      <div className="flex-1 h-screen w-full overflow-y-scroll bg-gray-800">
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
