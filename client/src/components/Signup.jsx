import React, { useState } from "react";
import "../App.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:3000/auth/signup", {
        username,
        email,
        password,
      })
      .then((response) => {
        if (response.data.status) {
          toast.success("Signup successful!");
          navigate("/login");
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Signup failed. Please try again.");
      });
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <form
        className="w-96 p-8 bg-gray-800 bg-opacity-50 backdrop-blur-md border border-gray-700 rounded-lg shadow-xl"
        onSubmit={handleSubmit}
      >
        <h2 className="text-3xl mb-6 text-white font-bold text-center">
          Sign Up
        </h2>

        <div className="mb-4">
          <label
            htmlFor="username"
            className="block mb-2 text-sm font-medium text-gray-300"
          >
            Username:
          </label>
          <input
            type="text"
            id="username"
            placeholder="Enter your username"
            className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-300"
          >
            Email:
          </label>
          <input
            type="email"
            id="email"
            autoComplete="off"
            placeholder="Enter your email"
            className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="password"
            className="block mb-2 text-sm font-medium text-gray-300"
          >
            Password:
          </label>
          <input
            type="password"
            id="password"
            placeholder="••••••••"
            className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full p-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-300"
        >
          Sign Up
        </button>

        <p className="mt-4 text-sm text-gray-300 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-gray-100 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
