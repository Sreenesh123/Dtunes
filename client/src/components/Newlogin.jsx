import React, { useEffect } from "react";
import "../App.css";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

const Newlogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for authorization code in URL
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");

    if (code && state) {
      // Exchange code for token
      exchangeCodeForToken(code, state);
    }
  }, [location]);

  const handleDAuthLogin = () => {
    const clientId = "YOUR_CLIENT_ID";
    const redirectUri = encodeURIComponent("http://localhost:5173/"); // Your frontend callback URL
    const state = generateRandomString(16); // Generate a random state
    const nonce = generateRandomString(16); // Generate a random nonce

    localStorage.setItem("dauth_state", state);

    const authUrl = `https://auth.delta.nitt.edu/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&grant_type=authorization_code&state=${state}&scope=email+openid+profile+user&nonce=${nonce}`;

    window.location.href = authUrl;
  };

  const exchangeCodeForToken = (code, state) => {
    const storedState = localStorage.getItem("dauth_state");
    if (state !== storedState) {
      toast.error("Invalid state parameter");
      return;
    }

    // Clear the stored state
    localStorage.removeItem("dauth_state");

    const tokenUrl = "https://auth.delta.nitt.edu/api/oauth/token";
    const clientId = "nL5GDqobscCzFD01";
;
    const clientSecret = "G7AAEow1KCvg.c.g5N0lDvUq_04Dhb1m";
    const redirectUri = "http://localhost:5173/login";

    const data = new URLSearchParams();
    data.append("client_id", clientId);
    data.append("client_secret", clientSecret);
    data.append("grant_type", "authorization_code");
    data.append("code", code);
    data.append("redirect_uri", redirectUri);

    axios
      .post(tokenUrl, data)
      .then((response) => {
        const { access_token, id_token } = response.data;
        // Store tokens securely (consider using HttpOnly cookies on your backend)
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("id_token", id_token);

        // Fetch user details
        fetchUserDetails(access_token);
      })
      .catch((error) => {
        console.error("Error exchanging code for token:", error);
        toast.error("Authentication failed. Please try again.");
      });
  };

  const fetchUserDetails = (accessToken) => {
    axios
      .post("https://auth.delta.nitt.edu/api/resources/user", null, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        // Handle user details, e.g., store in state or context
        console.log("User details:", response.data);
        toast.success("Login successful!");
        navigate("/"); // Redirect to home page or dashboard
      })
      .catch((error) => {
        console.error("Error fetching user details:", error);
        toast.error("Failed to fetch user details. Please try again.");
      });
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
        >
          Login with DAuth
        </button>

        <p className="mt-4 text-sm text-gray-300 text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="text-gray-100 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Newlogin;
