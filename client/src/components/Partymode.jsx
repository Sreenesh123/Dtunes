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
  const navigate = useNavigate();
const {
  isAuthenticated,
  setIsAuthenticated,
  loading,
  setLoading,
  email,
  setEmail,
  verifyUser,
} = useContext(PlayerContext);

  useEffect(() => {
    fetchParties();
  }, []);
     
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
