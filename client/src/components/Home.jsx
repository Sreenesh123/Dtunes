import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { PlayerContext } from "../context/PlayerContext";
import { useNavigate } from "react-router-dom";
import ListPlaylist from "./ListPlaylist";
import SearchSongs from "./SearchSongs";


const retryWithBackoff = async (fn, retries = 5, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0 || !error.response || error.response.status !== 429) {
      throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
};

const Home = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [savedMessage, setSavedMessage] = useState("");
  const token = localStorage.getItem("token");
  const {
    
    setAndPlayPlaylist,
    setSongsData,
    isAuthenticated,
    setIsAuthenticated,
    loading,
    setLoading,
    email,
    setEmail,
    verifyUser,
  } = useContext(PlayerContext);

   useEffect(() => {
     verifyUser();
   }, []);

  

  const fetchFeaturedPlaylists = useCallback(async () => {
    // try {
    //   const fetchPlaylists = async () => {
    //     return axios.get(
    //       "https://api.spotify.com/v1/browse/featured-playlists",
    //       {
    //         headers: {
    //           Authorization: `Bearer ${localStorage.getItem("token")}`,
    //         },
    //       }
    //     );
    //   };
    //   const response = await retryWithBackoff(fetchPlaylists);
    //   setPlaylists(response.data.playlists.items);
    // } catch (error) {
    //   console.error("Error fetching featured playlists:", error);
    // }
  }, []);

  const fetchPlaylistTracks = useCallback(
    async (playlistId) => {
      try {
        const fetchTracks = async () => {
          return axios.get(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        };

        const response = await retryWithBackoff(fetchTracks);

        const detailedTracks = await Promise.all(
          response.data.items.map(async (item) => {
            const track = item.track;
            const trackDetailsResponse = await retryWithBackoff(() =>
              axios.get(`https://api.spotify.com/v1/tracks/${track.id}`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              })
            );
            return {
              id: track.id,
              name: track.name,
              image: trackDetailsResponse.data.album.images[0]?.url,
              album: trackDetailsResponse.data.album,
              artists: trackDetailsResponse.data.artists,
              preview_url: track.preview_url,
            };
          })
        );

        setPlaylistTracks(detailedTracks);
        setSongsData(detailedTracks);
        return detailedTracks;
      } catch (error) {
        console.error("Error fetching playlist tracks:", error);
      }
    },
    [setSongsData]
  );

   const fetchTrackDetails = useCallback(async (trackId) => {
     try {
       const fetchTrack = async () => {
         return axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
           headers: {
             Authorization: `Bearer ${localStorage.getItem("token")}`,
           },
         });
       };
       const response = await retryWithBackoff(fetchTrack);
       return response.data;
     } catch (error) {
       console.error("Error fetching track details:", error);
       return {};
     }
   }, []);

  const checkIfPlaylistExists = useCallback(
    async (playlistId) => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:3000/api/playlist/check/${playlistId}`,
          {
            params: { email: email },
          }
        );
        setLoading(false);
        return response.data.exists;
      } catch (error) {
        console.error("Error checking if playlist exists:", error);
        setLoading(false);
        return false;
      }
    },
    [email]
  );

  const saveAndPlayPlaylist = async (playlist, playlistId) => {
    console.log("clicked");
    try {
      // const exists = await checkIfPlaylistExists(playlistId);
      // if (exists) {
      //   const tracks = await fetchPlaylistTracks(playlistId);
      //   setAndPlayPlaylist(tracks);
      //   setSavedMessage("Playlist found and playing successfully!");
      // } else {
      const tracks = await fetchPlaylistTracks(playlistId);
      if (tracks && tracks.length > 0) {
        const trackDetailsPromises = tracks.map(async (trackItem) => {
          const trackDetails = await fetchTrackDetails(trackItem.id);
          return {
            id: trackItem.id,
            name: trackItem.name,
            image: trackItem.album.images ? trackItem.album.images[0] : "",
            preview_url: trackItem.preview_url,
            duration: trackDetails.duration_ms,
          };
        });

        const tracksDetails = await Promise.all(trackDetailsPromises);
        await axios.post("http://localhost:3000/api/playlist/add", {
          id: playlistId,
          name: playlist.name,
          image: playlist.images[0] ? playlist.images[0].url : null,
          desc: playlist.description,
          tracks: JSON.stringify(tracksDetails),
          email: email,
        });

        setAndPlayPlaylist(tracks);
        setSavedMessage("Playlist saved and playing successfully!");
      }
    } catch (error) {
      console.error("Error saving and playing playlist:", error);
      setSavedMessage("Failed to save and play playlist.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white ">
      <ListPlaylist />
    </div>
  );
};

export default Home;
