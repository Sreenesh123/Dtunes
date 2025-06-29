import React, { useEffect, useState, useContext } from "react";
import { assets } from "../assets/frontend-assets/assets";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { setClientToken } from "../spotify";
import { PlayerContext } from "../context/PlayerContext";
import SearchSongs from "./SearchSongs";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const {
    email,
  } = useContext(PlayerContext);

  const [friendRequests, setFriendRequests] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [tokenActive, setTokenActive] = useState(false);

  useEffect(() => {
    if (email)
      {
        setTokenActive(true)
      }else{
        setTokenActive(false)
      }
       fetchFriendRequests(email);
   
  }, [email]);

  const fetchFriendRequests = async (email) => {
    console.log(email);
    const response = await axios
      .get(`http://localhost:3000/api/users/friend-requests/${email}`)
      .then((response) => {
        console.log("Raw response data:", response.data.friendrequests);
        setFriendRequests(response.data.friendrequests);
      })
      .catch((error) => {
        console.error("Error fetching friend requests:", error);
      });
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleFriendRequestClick = async (request, action) => {
    try {
      if (action === "accept") {
        const response = await axios.post(
          "http://localhost:3000/api/users/accept-friend-request",
          {
            userEmail: email,
            friendEmail: request,
          }
        );
        console.log("Friend request accepted:", response.data);

        setFriendRequests((prevRequests) =>
          prevRequests.filter((req) => req !== request)
        );
      } else if (action === "decline") {
        const response = await axios.post(
          "http://localhost:3000/api/users/decline-friend-request",
          {
            userEmail: email,
            friendEmail: request,
          }
        );
        console.log("Friend request declined:", response.data);

        setFriendRequests((prevRequests) =>
          prevRequests.filter((req) => req !== request)
        );
      }
    } catch (error) {
      console.error("Error handling friend request:", error);
    }
  };

  const handleLogin = () => {
    console.log("handle login");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3000/auth/logout");
      localStorage.removeItem("dauthtoken");
      localStorage.removeItem("token")
      localStorage.removeItem("dauth_state");
      setTokenActive(false);
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <>
      <div className="w-full flex justify-between items-center font-semibold p-4 rounded-lg text-white">
        <div className="flex items-center gap-2">
          <img
            onClick={() => navigate(-1)}
            className="w-8 bg-black p-2 rounded-2xl cursor-pointer"
            src={assets.arrow_left}
            alt="Back"
          />
          <img
            onClick={() => navigate(+1)}
            className="w-8 bg-black p-2 rounded-2xl cursor-pointer"
            src={assets.arrow_right}
            alt="Forward"
          />
        </div>

        {location.pathname === "/Search" && (
          <div className="w-[80%] rounded-full">
            <SearchSongs />
          </div>
        )}

        <div className="flex items-center gap-4">
          {tokenActive ? (
            <button
              onClick={handleLogout}
              className="bg-white hover:bg-gray-500 text-black text-[15px] px-4 py-1 mr-3 rounded-2xl cursor-pointer"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="bg-white hover:bg-gray-500 text-black text-[15px] px-4 py-1 rounded-2xl cursor-pointer"
            >
              Login
            </button>
          )}
          <div className="relative">
            <div
              className="bg-gray-500 text-white w-8 h-8 rounded-full cursor-pointer flex items-center justify-center"
              onClick={toggleDropdown}
            >
              U
            </div>
            {showDropdown && (
              <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  {friendRequests.length > 0 ? (
                    friendRequests.map((request) => (
                      <div
                        key={request}
                        className="flex items-center justify-between px-4 py-2"
                      >
                        <p className="text-black">{request}</p>
                        <div>
                          <button
                            type="button"
                            onClick={() =>
                              handleFriendRequestClick(request, "accept")
                            }
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md mr-2"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleFriendRequestClick(request, "decline")
                            }
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="px-4 py-2 text-gray-600">
                      No friend requests
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
