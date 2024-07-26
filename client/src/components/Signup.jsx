import React, { useState } from "react";
import "../App.css";
import Axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import bgImage from "../assets/frontend-assets/bg.jpg";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    Axios.post("http://localhost:3000/auth/signup", {
      username,
      email,
      password,
    })
      .then((response) => {
        if (response.data.status) {
          navigate("/login");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <div
      className="flex justify-center items-center h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <form
        className="w-80 p-5 border border-gray-300 rounded-lg shadow-lg  backdrop-blur-3xl"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl mb-5">Sign Up</h2>

        <label htmlFor="username" className="block mb-2">
          Username:
        </label>
        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          onChange={(e) => setUsername(e.target.value)}
        />

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
          Sign Up
        </button>
        <p className="mt-4">
          Have an Account?{" "}
          <Link to="/login" className="text-black hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
