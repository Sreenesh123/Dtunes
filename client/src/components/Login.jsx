import React, { useState, useEffect } from "react";
import "../App.css";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");

    if (code && state) {
      exchangeCodeForToken(code, state);
    }
  }, [location]);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:3000/auth/login", {
        email,
        password,
      })
      .then((response) => {
        if (response.data.status) {
          getSpotifyToken();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("An error occurred. Please try again.");
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
        toast.error("Failed to get Spotify token. Please try again.");
      });
  };

  const handleDAuthLogin = async () => {
    try {
      const response = await axios.get("http://localhost:3000/auth/dauth-url");
      const { authUrl, state } = response.data;
      localStorage.setItem("dauth_state", state);
      window.location.href = authUrl;
    } catch (error) {
      console.error("Error getting DAuth URL:", error);
      toast.error("Failed to initiate login. Please try again.");
    }
  };

  const exchangeCodeForToken = async (code, state) => {
    const storedState = localStorage.getItem("dauth_state");
    if (state !== storedState) {
      toast.error("Invalid state parameter");
      return;
    }
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/auth/exchange-token",
        { code }
      );
      const { access_token, id_token } = response.data;
      await fetchUserDetails(access_token);
    } catch (error) {
      console.error("Error exchanging code for token:", error);
      toast.error("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

 const fetchUserDetails = async (accessToken) => {
   try {
     const response = await axios.get(
       "http://localhost:3000/auth/user-details",
       {
         headers: {
           Authorization: `Bearer ${accessToken}`,
         },
       }
     );

     if (response.data.status) {
        localStorage.setItem("dauthtoken",response.data.dauthtoken)
       toast.success("Login successful!");
       getSpotifyToken();
     } else {
       toast.error(response.data.message);
     }
   } catch (error) {
     console.error("Error fetching user details:", error);
     toast.error("Failed to fetch user details. Please try again.");
   }
 };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br text-white from-black via-gray-900 to-gray-800">
      <form
        className="w-96 p-8 bg-gray-800 bg-opacity-50 backdrop-blur-md border border-gray-700 rounded-lg shadow-xl"
        onSubmit={handleSubmit}
      >
        <h2 className="text-3xl mb-6 text-white font-bold text-center">
          Login
        </h2>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-300"
          >
            Email:
          </label>
          <input
            type="email"
            autoComplete="off"
            placeholder="Email"
            className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block mb-2">
            Password:
          </label>
          <input
            type="password"
            placeholder="******"
            className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full p-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-300"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

        <button
          type="button"
          onClick={handleDAuthLogin}
          className="w-full p-2 mt-6 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Login with DAuth"}
        </button>

        <Link
          to="/forgotPassword"
          className="block mt-6 text-white text-sm hover:underline"
        >
          Forgot Password?
        </Link>
        <p className="mt-4 text-sm">
          Don't Have Account?{" "}
          <Link to="/signup" className="text-white text-sm hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Login;
