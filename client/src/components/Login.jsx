import React, { useEffect, useState } from "react";
import "../App.css";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
console.log(code,state)
    if (code && state) {
      exchangeCodeForToken(code, state);
    }
  }, [location]);

  const handleDAuthLogin = () => {
    const clientId = "nL5GDqobscCzFD01";
    const redirectUri = encodeURIComponent("http://localhost:5173/login");
    const state = generateRandomString(16);
    const nonce = generateRandomString(16);

    localStorage.setItem("dauth_state", state);

    const authUrl = `https://auth.delta.nitt.edu/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&grant_type=authorization_code&state=${state}&scope=email+openid+profile+user&nonce=${nonce}`;

    window.location.href = authUrl;
  };

  const exchangeCodeForToken = async (code, state) => {
    console.log("entered")
    const storedState = localStorage.getItem("dauth_state");
    if (state !== storedState) {
      toast.error("Invalid state parameter");
      return;
    }

    // localStorage.removeItem("dauth_state");

    setIsLoading(true);

    const tokenUrl = "https://auth.delta.nitt.edu/api/oauth/token";
    const clientId = "nL5GDqobscCzFD01";
    const clientSecret = "G7AAEow1KCvg.c.g5N0lDvUq_04Dhb1m";
    const redirectUri = encodeURIComponent("http://localhost:5173/login");

    try {
      const response = await axios.post(tokenUrl, null, {
        params: {
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "authorization_code",
          code: code,
          redirect_uri: redirectUri,
        },
      });

      const { access_token, id_token } = response.data;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("id_token", id_token);

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
      const response = await axios.post(
        "https://auth.delta.nitt.edu/api/resources/user",
        null,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("User details:", response.data);
      toast.success("Login successful!");
      navigate("/");
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to fetch user details. Please try again.");
    }
  };

  const generateRandomString = (length) => {
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let text = "";
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <div className="w-96 p-8 bg-gray-800 bg-opacity-50 backdrop-blur-md border border-gray-700 rounded-lg shadow-xl">
        <h2 className="text-3xl mb-6 text-white font-bold text-center">
          Login
        </h2>

        <button
          onClick={handleDAuthLogin}
          className="w-full p-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-300 mb-4"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login with DAuth"}
        </button>

        <p className="mt-4 text-sm text-gray-300 text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="text-gray-100 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
