// import React, { useContext } from "react";
// import Navbar from "./Navbar";
// import { useParams } from "react-router-dom";
// import { assets } from "../assets/frontend-assets/assets";
// import { PlayerContext } from "../context/PlayerContext";
// import { useState } from "react";
// import { useEffect } from "react";
// import Albumitem from "./AlbumDetail";

const DisplayAlbum = ({ album }) => {
//   const { id } = useParams();
//   console.log(id);
//   const [albumData, setAlbumData] = useState("");
//   const { playWithId, albumsData, songsData,isAuthenticated,verifyUser } = useContext(PlayerContext);
//    useEffect(() => {
//      verifyUser();
//    }, []);


//   useEffect(() => {
//     albumsData.map((item) => {
//       if (item._id === id) {
//         setAlbumData(item);
//       }
//     });
//   }, []);


//   if (isAuthenticated === null) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-900">
//         <div className="w-16 h-16 border-4 border-gray-400 border-t-green-500 rounded-full animate-spin"></div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
//         <p className="text-lg mb-4">Please log in to access this page.</p>
//         <button
//           onClick={() => navigate("/login")}
//           className="bg-yellow-500 text-gray-900 px-6 py-2 rounded-full hover:bg-yellow-400 transition"
//         >
//           Login
//         </button>
//       </div>
//     );
//   }
//   return albumData ? (
//     <>
//       <Navbar />
//       <div className="mt-10 flex gap-8 flex-col md:flex-row md:items-end">
//         <img className="w-48 rounded" src={albumData.image} alt="" />
//         <div className="flex flex-col">
//           <p>Playlist</p>
//           <h2 className="text-5xl font-bold mb-4 md:text-7xl">
//             {albumData.name}
//           </h2>
//           <h4>{albumData.desc}</h4>
//           <p className="mt-1"></p>
//         </div>
//       </div>
//       <div className="grid grid-cols-3 sm:grid-cols-4 mt-10 mb-4 pl-2 text-[#a7a7a7]">
//         <p>
//           <b className="mr-4">#</b>
//         </p>
//         <p>Album</p>
//         <p className="hidden sm:block">Date Added</p>
//         <img className="m-auto w-4" src={assets.clock_icon} alt="" />
//       </div>
//       <hr />
//       {songsData
//         .filter((item) => {
//           item.album === album.name;
//         })
//         .map((item, index) => (
//           <div
//             onClick={() => playWithId(item._id)}
//             key={index}
//             className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-2 items-center text-[#a7a7a7] hover:bg-[#ffffff2b] cursor-pointer"
//           >
//             <p className="text-white">
//               <b className="mr-4 text-[#a7a7a7]">{index + 1}</b>
//               <img className="inline w-10 mr-5" src={item.image} alt="" />
//               {item.name}
//             </p>
//             <p className="text-[15px]">{albumData.name}</p>
//             <p className="text-[15px] hidden sm:block"></p>
//             <p className="text-[15px] text-center">{item.duration}</p>
//           </div>
//         ))}
//     </>
//   ) : null;
};

export default DisplayAlbum;
