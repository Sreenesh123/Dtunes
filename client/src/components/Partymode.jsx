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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { email, joinParty, leaveParty, isPartyMode, partyId, partyStatus } =
    useContext(PlayerContext);

  useEffect(() => {
    fetchParties();
  }, []);
  const fetchParties = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/api/parties");
      setParties(response.data);
    } catch (error) {
      console.error("Error fetching parties:", error);
      setError("Error fetching parties. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const deleteparty = async (id) => {
    if (!window.confirm("Are you sure you want to delete this party?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `http://localhost:3000/api/parties/remove/${id}`
      );
      if (response) {
        console.log("Party deleted successfully");
        setParties(parties.filter((party) => party._id !== id));

        if (partyId === id) {
          leaveParty();
        }
      }
    } catch (error) {
      console.error("Error deleting party:", error);
      setError("Failed to delete party. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleCreateParty = async () => {
    if (!partyName.trim()) {
      setError("Please enter a party name");
      return;
    }

    setLoading(true);
    setError(null);

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
      joinParty(response.data._id);
      navigate(`/party/${response.data._id}`);
    } catch (error) {
      console.error("Error creating party:", error);
      setError("Error creating party. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleJoinParty = (partyId) => {
    joinParty(partyId);
    navigate(`/party/${partyId}`);
  };

  return (
    <div className="w-full p-6 bg-gradient-to-br from-gray-900 to-black text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Party Mode
      </h1>

      {isPartyMode && (
        <div className="mb-8 p-4 bg-gradient-to-r from-green-900/50 to-blue-900/50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Currently in a party</h2>
          <p>Party ID: {partyId}</p>
          <p>Status: {partyStatus.status}</p>
          <button
            onClick={() => navigate(`/party/${partyId}`)}
            className="mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md"
          >
            Return to Party
          </button>
        </div>
      )}

      <div className="bg-gray-800/70 p-6 rounded-xl shadow-lg mb-10">
        <h2 className="text-2xl font-semibold mb-4">Create New Party</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={partyName}
            onChange={(e) => setPartyName(e.target.value)}
            placeholder="Enter party name"
            className="bg-gray-700 text-white rounded-md py-3 px-4 outline-none placeholder-gray-400 flex-grow focus:ring-2 focus:ring-purple-400"
          />
          <button
            onClick={handleCreateParty}
            disabled={loading || !partyName.trim()}
            className={`bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-8 rounded-md shadow-lg transition ${
              loading || !partyName.trim()
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {loading ? "Creating..." : "Create Party"}
          </button>
        </div>
        {error && <p className="text-red-400 mt-3">{error}</p>}
      </div>

      <div className="w-full">
        <h2 className="text-2xl font-semibold mb-6 border-b border-gray-700 pb-2">
          Available Parties
        </h2>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : parties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {parties.map((party) => (
              <div
                key={party._id}
                className="bg-gray-800/80 backdrop-blur rounded-xl p-5 shadow-lg transform transition hover:scale-105 hover:shadow-xl"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white">{party.name}</h3>
                  {party.createdBy === email && (
                    <button
                      onClick={() => deleteparty(party._id)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete party"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>

                <p className="text-gray-400 mb-2">Host: {party.createdBy}</p>
                <p className="text-gray-400 mb-4">
                  Participants:{" "}
                  {party.participants ? party.participants.length : 0}
                </p>

                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => handleJoinParty(party._id)}
                    className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-2 px-4 rounded transition"
                  >
                    Join Now
                  </button>

                  <NavLink
                    to={`/party/${party._id}`}
                    className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded transition"
                  >
                    View Details
                  </NavLink>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <p>No parties available. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartyMode;
