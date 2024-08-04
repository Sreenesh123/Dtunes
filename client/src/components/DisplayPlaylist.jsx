import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { PlayerContext } from "../context/PlayerContext";

const MstoMinutes = (ms) => {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

const MstoHours = (ms) => {
  const totalSeconds = ms / 1000;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${hours} hr ${minutes} min ${seconds} sec`;
};

const DisplayPlaylist = () => {
  const {
    setSongsData,
    setSelectedTrack,
    setselectedTrackData,
    playlistimage,
    isAuthenticated,
    loading,
    embedController,
    setLoading,
    email,
    verifyUser,
	setTrack
  } = useContext(PlayerContext);
  const { id, playlistname } = useParams();
  const [songs, setSongs] = useState([]);
  const [totalDuration, setTotalDuration] = useState(0);
  
  useEffect(() => {
    const fetchPlaylistTracks = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/playlist/${email}/${id}`
        );
        if (response.data.success) {
			console.log(response.data)
          setSongs(response.data.tracks);
          const total = response.data.tracks.reduce(
            (acc, track) => acc + track.duration,
            0
          );
          setTotalDuration(total);
        }
      } catch (error) {
        toast.error("Error occurred while fetching playlist tracks.");
        console.error(error.message);
      }
    };

    fetchPlaylistTracks();
  }, [id, email]);

  const handleSongPlay = (track,songs,index) => {
	console.log(track)
	 setSongsData(songs)
	setSelectedTrack(track);
	setTrack(track)
    // setselectedTrackData(track);
	console.log(embedController)
	   if (embedController) {
		console.log("embed controller present")
       embedController.loadUri(track.uri);
       embedController.addListener("playback_update", ({ data }) => {
         if (data.position === data.duration) {
           const nextIndex = (index + 1) % songs.length;
           handleSongPlay(songs[nextIndex],songs, nextIndex);
         }
       });
     }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-16 h-16 border-4 border-gray-400 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <img
        src={playlistimage}
        alt=""
        className="w-48 h-48 object-cover rounded-lg mb-4"
      />
      <h1 className="text-3xl font-bold mb-2">{playlistname}</h1>
      <p className="text-gray-400 mb-6">
        {songs.length} songs • {MstoHours(totalDuration)}
      </p>
      <div className="overflow-x-auto">
        <div className="min-w-full bg-gray-800 rounded-lg shadow-lg">
          <div className="border-b border-gray-700">
            <div className="grid grid-cols-12 gap-4 p-4 text-gray-400 text-xs font-medium">
              <div className="col-span-1">#</div>
              <div className="col-span-6 flex items-center">Title</div>
              <div className="col-span-3 text-center">Album</div>
              <div className="col-span-2 text-center">Duration</div>
            </div>
          </div>
          {songs.map((song, index) => (
            <div
              key={index}
              onClick={()=>{handleSongPlay(song,songs,index)}}
              className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-700 cursor-pointer transition duration-200 ease-in"
            >
              <div className="col-span-1 flex items-center justify-center text-sm font-medium text-gray-300">
                {index + 1}
              </div>
              <div className="col-span-6 flex items-center">
                <img
                  className="w-14 h-14 rounded-md mr-4"
                  src={song.image.url}
                  alt={song.name}
                />
                <div>
                  <p className="text-sm font-medium">{song.name}</p>
                  <p className="text-xs text-gray-400">{song.artist}</p>
                </div>
              </div>
              <div className="col-span-3 text-center text-sm">{song.album}</div>
              <div className="col-span-2 text-center text-sm">
                {MstoMinutes(song.duration)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DisplayPlaylist;
