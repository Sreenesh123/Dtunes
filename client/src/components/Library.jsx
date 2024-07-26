import React, { useEffect, useState, useContext } from "react";
import apiClient from "../spotify";
import { PlayerContext } from "../context/PlayerContext";

const Library = () => {
  const [playlists, setPlaylists] = useState(null);
  const { setSongsData, setTrack, play } = useContext(PlayerContext);

  useEffect(() => {
    console.log("Library component mounted");
    apiClient
      .get("me/playlists")
      .then((response) => {
        console.log(response.data.items);
        setPlaylists(response.data.items);
      })
      .catch((error) => {
        console.error("Error fetching playlists:", error);
      });
  }, []);

  const handlePlaylistClick = async (playlistId) => {
    try {
      const response = await apiClient.get(`playlists/${playlistId}/tracks`);
      const tracks = response.data.items.map((item) => item.track);
      setSongsData(tracks);
      setTrack(tracks[0]);
      play();
    } catch (error) {
      console.error("Error fetching playlist tracks:", error);
    }
  };

  return (
    <div className="w-94 h-90 p-3 flex flex-wrap overflow-y-auto justify-between">
      {playlists?.map((playlist) => (
        <div
          key={playlist.id}
          className="relative w-1/6 h-1/3 rounded-lg bg-gradient-to-b from-gray-700 to-transparent border border-gray-400 p-1 mb-2 transition-transform cursor-pointer hover:scale-102"
          onClick={() => handlePlaylistClick(playlist.id)}
        >
          <img
            src={playlist.images[0]?.url}
            alt={playlist.name}
            className="w-full h-full rounded-lg"
          />
          <div className="absolute bottom-0 right-0 opacity-0 w-4/5 h-1/3 rounded-lg bg-gradient-to-b from-transparent to-gray-700 flex items-end justify-end p-2 transition-opacity hover:opacity-100">
            <p className="font-bold text-sm text-white truncate-2-lines">
              {playlist.name}
            </p>
            <p className="font-normal text-xs text-gray-300 truncate">
              {playlist.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Library;
