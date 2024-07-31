import React, { useState, useEffect, useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import { setClientToken } from "../spotify";
import { FaTrash } from "react-icons/fa";

const PartyMode = () => {
  const [partyName, setPartyName] = useState("");
  const [parties, setParties] = useState([]);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const navigate = useNavigate();
  const { email, setEmail } = useContext(PlayerContext);

  useEffect(() => {
    fetchParties();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedEmail = localStorage.getItem("email");

    if (token && storedEmail) {
      console.log("Retrieved token:", token);
      setClientToken(token);
      setEmail(storedEmail);
      setIsAuthenticated(true);
    } else {
      console.error("No token or email found.");
      setIsAuthenticated(false);
    }
  }, [setEmail]);

  const fetchParties = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/parties");
      setParties(response.data);
    } catch (error) {
      console.error("Error fetching parties:", error);
      setError("Error fetching parties. Please try again.");
    }
  };

  const deleteparty=async(id)=>
  {
    try{
      const response=await axios.post(`http://localhost:3000/api/parties/remove/${id}`);
      if(response)
      {
        console.log(response)
      }
    }
    catch(error)
    {
      console.log(error)
    }
  }

  const handleCreateParty = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/parties/create",
        {
          name: partyName,
          createdBy: email,
        }
      );
      setParties([...parties, response.data]);
      setPartyName("");
    } catch (error) {
      console.error("Error creating party:", error);
      setError("Error creating party. Please try again.");
    }
  };

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
    <div className=" w-full p-4">
      <div className="flex flex-col items-center mb-4">
        <input
          type="text"
          value={partyName}
          onChange={(e) => setPartyName(e.target.value)}
          placeholder="Enter party name"
          className="bg-gray-800 text-white rounded-md py-2 px-4 outline-none placeholder-gray-500 mb-2"
        />
        <button
          onClick={handleCreateParty}
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md outline-none"
        >
          Create Party
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="w-full">
        <h2 className="text-white text-xl mb-4">Available Parties:</h2>
        {parties.map((party) => (
          <div
            key={party._id}
            className="bg-gray-700 rounded-md p-4 mb-4 flex justify-between"
          >
            <div>
              <h3 className="text-white font-bold">{party.name}</h3>
              <p className="text-gray-400">Created by: {party.createdBy}</p>
            </div>

            <div className="flex space-x-7 items-center">
              <NavLink
                to={`/party/${party._id}`}
                className="text-blue-500 hover:underline"
              >
                View Party
              </NavLink>
              <FaTrash onClick={()=>deleteparty(party._id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartyMode;
