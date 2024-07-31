import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";
import { FaSadTear } from "react-icons/fa"; // Import the sad face icon

const AlbumDetail = () => {
  const { id, name } = useParams();
  const [tracks, setTracks] = useState([]);
  const email = localStorage.getItem("email");
  const { songsData, setSongsData, playWithId, setselectedTrackData } =
    useContext(PlayerContext);

  const playTrack = (track) => {
    console.log(track);
    setSongsData([track]);
    setselectedTrackData(track);
    playWithId(track._id,[track]);
  };

  // useEffect(() => {
  //   if (songsData.length > 0) {
  //     playWithId(songsData[0]._id);
  //   }
  // }, [songsData, playWithId]);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/album/albumsongs/${id}/${email}`
        );
        if (response.data.success) {
          setTracks(response.data.tracks);
        }
      } catch (error) {
        console.error(
          "Error occurred while fetching album tracks:",
          error.message
        );
      }
    };

    fetchTracks();
  }, [id, email]);

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-200 bg-gray-900">
        <FaSadTear className="text-6xl mb-4 text-blue-500" />
        <h1 className="text-2xl font-bold">Oops, no tracks found...</h1>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-200">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{name}</h1>
      </div>
      <h2 className="text-2xl font-bold mb-4">Tracks</h2>
      <div>
        {tracks.map((track, index) => (
          <div
            key={index}
            onClick={() => playTrack(track)}
            className="flex items-center gap-4 p-4 border-b border-gray-700 bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <img
              className="w-12 h-12 object-cover rounded-md shadow-md"
              src={track.image}
              alt={track.name}
            />
            <div className="flex-grow">
              <p className="font-medium text-lg">{track.name}</p>
              <p className="text-gray-400">{track.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlbumDetail;
