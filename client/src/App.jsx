import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Sidebar from "./components/Sidebar";
import Player from "./components/Player";
import Display from "./components/Display";
import React, { useContext, useState, useEffect } from "react";
import { PlayerContext } from "./context/PlayerContext.jsx";
import Spotifyiframe from "./components/Spotifyiframe.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./custom-toast.css";
import Notauthenticated from "./components/Notauthenticated.jsx";


export const url = "http://localhost:3000";

function App() {
  const {
    audioRef,
    Track,
    isAuthenticated,
  } = useContext(PlayerContext);
  const location = useLocation();

  const showSidebarAndPlayer = !(
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/forgotpassword" ||
    location.pathname.startsWith("/resetPassword")
  );

  return (
    <div className="h-screen bg-black">
      <ToastContainer />
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/resetPassword/:token" element={<ResetPassword />} />
      </Routes>

      {showSidebarAndPlayer && (
        <>
          <div className="h-[90%] w-full bg-black flex justify-center">
            <Sidebar />
            <Spotifyiframe />
            <Routes>             
                <Route
                  path="/*"
                  element={isAuthenticated ? <Display /> : <Notauthenticated />}
                />            
            </Routes>
          </div>
          <Player />
        </>
      )}
      <audio
        ref={audioRef}
        src={Track ? Track.file : ""}
        preload="auto"
      ></audio>
    </div>
  );
}

export default App;
