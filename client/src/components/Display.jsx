import React, { useEffect, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import DisplayHome from "./DisplayHome";
import DisplayAlbum from "./DisplayAlbum";
import { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import Navbar from "./Navbar";
import Library from "./Library";
import SearchSongs from "./SearchSongs";
import AddPlaylist from "./AddPlaylist";
import ListPlaylist from "./ListPlaylist";
import Displayartist from "./Displayartist";
import AddAlbum from "./AddAlbum";
import AddSong from "./AddSong";
import ListAlbum from "./ListAlbum";
import ListSong from "./ListSong";
import PartyMode from "./Partymode";
import Party from "./Party";
import Home from "./Home";
import DisplayPlaylist from "./DisplayPlaylist";
import AlbumDetail from "./AlbumDetail";
import ListeningStats from "./ListeningStats";
import Emptypage from "./Emptypage";

const Display = () => {
  const { albumsData } = useContext(PlayerContext);
  const displayRef = useRef();
  const location = useLocation();
  const isAlbum = location.pathname.includes("album");
  const albumId = isAlbum ? location.pathname.split("/").pop() : "";
  // const bgColor =
  //   isAlbum && albumsData && albumsData.length > 0
  //     ? console.log(albumsData) &&
  //       albumsData.find((x) => x._id == albumId).bgColor
  //     : "#121212";

  // useEffect(() => {
  //   if (isAlbum) {
  //     displayRef.current.style.background = `linear-gradient(${bgColor},#121212)`;
  //   } else {
  //     displayRef.current.style.background = "#121212";
  //   }
  // }, [isAlbum, bgColor]);

  return (
    <div
      ref={displayRef}
      className="w-[100%] m-2  pt-4 rounded-lg bg-gradient-to-b from-gray-900 to-black text-white overflow-auto lg:w-[75%] lg:ml-0 "
    >
      <Navbar />

      {console.log("Current path:", location.pathname)}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user-playlist" element={<Library />} />
        <Route
          path="/album/:id"
          element={
            <DisplayAlbum
              album={albumsData && albumsData.find((x) => x._id == albumId)}
            />
          }
        />

        <Route path="/add-playlist" element={<AddPlaylist />} />
        <Route path="/list-playlist" element={<ListPlaylist />} />
        <Route path="/list-artist" element={<Displayartist />} />
        <Route path="/add-song" element={<AddSong />} />
        <Route path="/add-album" element={<AddAlbum />} />
        <Route path="/list-song" element={<ListSong />} />
        <Route path="/list-album" element={<ListAlbum />} />
        <Route path="/party" element={<PartyMode />} />
        <Route path="/party/:partyId" element={<Party />} />
        <Route
          path="/playlist/display/:id/:playlistname"
          element={<DisplayPlaylist />}
        />
        <Route path="/Search" element={<Emptypage />} />
        <Route path="/album/albumsongs/:id/:name" element={<AlbumDetail />} />
        <Route
          path="/listening-stats"
          element={
            <ListeningStats email={localStorage.getItem("email")} period={30} />
          }
        />
      </Routes>
    </div>
  );
};

export default Display;
