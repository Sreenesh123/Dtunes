import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Home from "./components/Home";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import { AnimatePresence } from "framer-motion";
import Sidebar from "./components/Sidebar";
import Player from "./components/Player";
import Display from "./components/Display";
import React, { useContext, useState, useEffect } from "react";
import { PlayerContext } from "./context/PlayerContext.jsx";
import { setClientToken } from "./spotify";
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
    songsData,
    isAuthenticated,
    setIsAuthenticated,
    loading,
    setLoading,
    email,
    setEmail,
    verifyUser,
  } = useContext(PlayerContext);
  const location = useLocation();

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  // const [token, setToken] = useState("");
  // useEffect(() => {
  //   const token = window.localStorage.getItem("token");
  //   const hash = window.location.hash;
  //   window.location.hash = "";
  //   if (!token && hash) {
  //     const _token = hash.split("&")[0].split("=")[1];
  //     window.localStorage.setItem("token", _token);
  //     setToken(_token);
  //     setClientToken(_token);
  //   } else {
  //     setToken(token);
  //     setClientToken(token);
  //   }
  // }, []);

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
