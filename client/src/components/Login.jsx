import React, { useState } from "react";
import "../App.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import bgImage from "../assets/frontend-assets/bg.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

 const handleSubmit = (e) => {
   e.preventDefault();
   axios
     .post("http://localhost:3000/auth/login", {
       email,
       password,
     })
     .then((response) => {
       if (response.data.status) {
         localStorage.setItem("email", email);
         getSpotifyToken();
       }
     })
     .catch((err) => {
       console.log(err);
     });
 };
 
 const getSpotifyToken = () => {
   axios
     .get("http://localhost:3000/auth/spotify/token")
     .then((response) => {
       localStorage.setItem("token", response.data.access_token);
       window.location.href = "http://localhost:5173/";
     })
     .catch((error) => {
       console.error("Error getting Spotify access token:", error);
     });
 };

  return (
    <div
      className="flex justify-center items-center h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <form
        className="w-80 p-5 border border-gray-300 rounded-lg shadow-lg backdrop-blur-lg"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl mb-5">Login</h2>

        <label htmlFor="email" className="block mb-2">
          Email:
        </label>
        <input
          type="email"
          autoComplete="off"
          placeholder="Email"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password" className="block mb-2">
          Password:
        </label>
        <input
          type="password"
          placeholder="******"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Login
        </button>
        <Link
          to="/forgotPassword"
          className="block mt-4 text-black hover:underline"
        >
          Forgot Password?
        </Link>
        <p className="mt-4">
          Don't Have Account?{" "}
          <Link to="/signup" className="text-black hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
