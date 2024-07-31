// import React, { useState, useEffect } from "react";
// import { useNavigate, NavLink } from "react-router-dom";
// import "../index.css";
// import { assets } from "../assets/frontend-assets/assets";
// import FriendsCurrentTracks from "./FriendsCurrentTracks";
// import { FaBook, FaPlus } from "react-icons/fa";

// const Sidebar = () => {
//   const [email, setEmail] = useState(localStorage.getItem("email") || "");
//   const [token, setToken] = useState(localStorage.getItem("token") || "");
//   const navigate = useNavigate();

//   useEffect(() => {
//     const handleStorageChange = () => {
//       const newToken = localStorage.getItem("token");
//       const newEmail = localStorage.getItem("email");
//       if (newToken !== token) {
//         setToken(newToken);
//       }
//       if (newEmail !== email) {
//         setEmail(newEmail);
//       }
//     };

//     window.addEventListener("storage", handleStorageChange);

//     return () => {
//       window.removeEventListener("storage", handleStorageChange);
//     };
//   }, [token, email]);

//   return (
//     <div className="w-[23%] h-full pl-4 pr-4 flex flex-col gap-4  text-white lg:flex  shadow-lg">
//       <div className="bg-[#111727] h-[25%] mt-3 rounded-lg flex flex-col justify-center items-start p-4">
//         <div
//           onClick={() => navigate("/")}
//           className="flex items-center gap-4 pl-2 cursor-pointer  hover:bg-[#242424] p-2 rounded transition duration-300"
//         >
//           <img className="w-6" src={assets.home_icon} alt="Home Icon" />
//           <p className="font-bold text-lg">Home</p>
//         </div>
//         <div
//           onClick={() => navigate("/Search")}
//           className="flex items-center gap-4 pl-2 cursor-pointer  hover:bg-[#242424] p-2 rounded transition duration-300"
//         >
//           <img className="w-6" src={assets.search_icon} alt="Home Icon" />
//           <p className="font-bold text-lg">Search</p>
//         </div>
//       </div>
//       <div className="bg-[#111727] h- rounded-lg overflow-auto">
//         <div className="p-4 flex items-center justify-between">
//           <div className="flex items-center gap-3 cursor-pointer hover:bg-[#242424] p-2 rounded transition duration-300">
//             <FaBook className="w-8 h-8" />
//             <p className="font-semibold text-lg">Library</p>
//           </div>
//         </div>
//         <NavLink
//           to="/add-playlist"
//           className="p-4 bg-[#242424] m-2 rounded-lg font-semibold flex flex-col items-start justify-start gap-1 pl-4 hover:bg-[#333333] transition duration-300"
//         >
//           <button className="px-4 py-2 w-full bg-white text-[15px] text-black rounded-full mt-4 flex items-center gap-2 justify-center">
//             Create Playlist
//             <FaPlus />
//           </button>
//         </NavLink>

//         <NavLink
//           to="/list-artist"
//           className="p-4 bg-[#242424] m-2 rounded-lg font-semibold flex flex-col items-start justify-start gap-1 pl-4 hover:bg-[#333333] transition duration-300"
//         >
//           <button className="px-4 py-2 w-full bg-white text-[15px] text-black rounded-full mt-4 flex items-center gap-2 justify-center">
//             Artist
//           </button>
//         </NavLink>
//         <NavLink
//           to="/listening-stats"
//           className="p-4 bg-[#242424] m-2 rounded-lg font-semibold flex flex-col items-start justify-start gap-1 pl-4 hover:bg-[#333333] transition duration-300"
//         >
//           <button className="px-4 py-2 w-full bg-white text-[15px] text-black rounded-full mt-4 flex items-center gap-2 justify-center">
//             Stats
//           </button>
//         </NavLink>
//         <NavLink
//           to="/party"
//           className="p-4 bg-[#242424] m-2 rounded-lg font-semibold flex flex-col items-start justify-start gap-1 pl-4 hover:bg-[#333333] transition duration-300"
//         >
//           <button className="px-4 py-2 w-full bg-white text-[15px] text-black rounded-full mt-4 flex items-center gap-2 justify-center">
//             Party
//           </button>
//         </NavLink>
//         <div className="overflow-auto p-4">
//           <FriendsCurrentTracks email={email} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;

import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "../index.css";
import FriendsCurrentTracks from "./FriendsCurrentTracks";
import {
  FaHome,
  FaSearch,
  FaMusic,
  FaChartBar,
  FaUsers,
  FaPlusCircle,
} from "react-icons/fa";

const Sidebar = () => {
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = localStorage.getItem("token");
      const newEmail = localStorage.getItem("email");
      if (newToken !== token) setToken(newToken);
      if (newEmail !== email) setEmail(newEmail);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [token, email]);

  const NavItem = ({ to, icon: Icon, text }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center p-3 rounded-lg transition duration-300 ${
          isActive
            ? "bg-gradient-to-r from-gray-700 to-gray-600 text-white"
            : "text-gray-300 hover:bg-gray-700"
        }`
      }
    >
      <Icon className="w-6 h-6 mr-3" />
      <span className="font-medium">{text}</span>
    </NavLink>
  );

  return (
    <div className="w-[25%] h-[99%] mt-2 mr-3 rounded-lg bg-gray-900 text-white flex flex-col">
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-6 text-center">MusicApp</h1>
        <nav className="space-y-2">
          <NavItem to="/" icon={FaHome} text="Home" />
          <NavItem to="/Search" icon={FaSearch} text="Discover" />
          <NavItem to="/list-artist" icon={FaMusic} text="Artists" />
          <NavItem to="/listening-stats" icon={FaChartBar} text="Insights" />
          <NavItem to="/party" icon={FaUsers} text="Social" />
        </nav>
      </div>

      <div className="mt-auto p-5">
        <button
          onClick={() => navigate("/add-playlist")}
          className="w-full bg-gradient-to-r from-gray-800 to-gray-700 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center hover:from-gray-700 hover:to-gray-600 transition duration-300"
        >
          <FaPlusCircle className="mr-2" />
          New Playlist
        </button>
      </div>

      <div className="p-5 overflow-auto bg-gray-800 rounded-t-lg">
        <div className="overflow-auto max-h-48">
          <FriendsCurrentTracks email={email} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;