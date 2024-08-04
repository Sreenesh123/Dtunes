import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { PlayerContext } from "../context/PlayerContext";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaPlay, FaRandom } from "react-icons/fa";
import SearchSongs from "./SearchSongs";

const ListPlaylist = () => {
  const {
    setselectedTrackData,
    setSelectedTrack,
    setLiked,
    embedController,
    likedSongs,
    setSongsData,
    songsData,
    time,
    setTrack,
    playWithId,
    setPlaylistImage,
    playMode,
    setPlayMode,
    loading,
    email,
  } = useContext(PlayerContext);


  const [data, setData] = useState([]);
  const [userlikedsongs, setLikedsongs] = useState([]);

  const [showLikedSongs, setShowLikedSongs] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  

  const prevsongendref = useRef({ minute: 0, second: 0 });
  const navigate = useNavigate();



  const stopCurrentPlayback = useCallback(async () => {
    if (embedController) {
      await embedController.pause();
    }
    setTrack(null);
    setSelectedTrack(null);
    setselectedTrackData(null);
  }, [embedController, setTrack, setSelectedTrack, setselectedTrackData]);

// function for playing songs in djmode using preview url..................................................................................................................

  const playdjsongs = useCallback(
    async (playlist) => {
      if (playMode !== "dj") {
        await stopCurrentPlayback();
        setPlayMode("dj");
      }

      const tracks = playlist.tracks;
      setSongsData(tracks);

      if (tracks.length > 0) {
        setselectedTrackData(tracks[0]);
        setTrack(tracks[0])
        setCurrentSongIndex(0);
        console.log(tracks[0]);
        await playWithId(tracks[0]._id, tracks);
      } else {
        console.log("No tracks in the playlist");
      }
    },
    [
      setSongsData,
      setselectedTrackData,
      setCurrentSongIndex,
      playWithId,
      playMode,
      stopCurrentPlayback,
    ]
  );

// function for playing individual liked songs........................................................................................................................................................................

  const playTrack = useCallback(
    async (songs, song) => {
      setTrack(song);
      const isLiked = likedSongs.some(
        (track) =>
          (track.uri ? track.uri : "") === (song.uri ? song.uri : "none")
      );
      setLiked(isLiked);
      setSelectedTrack(song);
      setselectedTrackData({
        ...song,
        isLiked: isLiked,
      });

    //   if (embedController) {
    //     await embedController.loadUri(song.uri);
    //     await embedController.play();
    //   }

      return new Promise((resolve) => {
        if (embedController) {
          embedController.addListener("playback_update", (e) => {
            console.log("Playback update:", e.data.position, e.data.duration);
            if (e.data.position >= e.data.duration) {
              resolve();
            }
          });
        } else {
          resolve();
        }
      });
    },
    [
      setTrack,
      likedSongs,
      setLiked,
      setSelectedTrack,
      setselectedTrackData,
      embedController,
    ]
  );

// function for playing songs sequentially...........................................................................................................................................

  const playSequentially = useCallback(
    async (songs, startIndex = 0) => {
      if (playMode !== "playall") {
        await stopCurrentPlayback();
        setPlayMode("playall");
      }

      setSongsData(songs);
      if (startIndex >= songs.length) {
        startIndex=0;
        return;
      }
      const song = songs[startIndex];
      try {
        await playTrack(songs, song);
        setCurrentSongIndex(startIndex);
      } catch (error) {
        console.error("Error playing track:", error);
      }
    },
    [
      setSongsData,
      playTrack,
      setCurrentSongIndex,
      playMode,
      stopCurrentPlayback,
    ]
  );

  useEffect(() => {
    const reqtime = time;
    const currentTotalSeconds =
      reqtime.currentTime.minute * 60 + reqtime.currentTime.second;
    const totalSeconds =
      reqtime.totalTime.minute * 60 + reqtime.totalTime.second;
    const prevsongtotalseconds =
      prevsongendref.current.minute * 60 +
      prevsongendref.current.second;

    if (
      currentTotalSeconds >= totalSeconds &&
      currentTotalSeconds > 0 &&
      totalSeconds > 0 &&
      currentTotalSeconds !== prevsongtotalseconds
    ) {
      prevsongendref.current = reqtime.currentTime;
      playSequentially(songsData, currentSongIndex + 1);
    }
  }, [time, songsData, currentSongIndex, playSequentially]);

// fetching playlist......................................................................................................................

const fetchPlaylists = async () => {
 if(email)
 {
     try {
       const response = await axios.get(
         `http://localhost:3000/api/playlist/list/${email}`
       );
       if (response.data.success) {
         setData(response.data.playlists);
       }
     } catch (error) {
       toast.error("Error occurred while fetching playlists.");
       console.error(error.message);
     }
 }
  };

// fetching likedsongs of user......................................................................................................................................

  const fetchLikedSongs = async () => {
    if(email){try {
      const response = await axios.get(
        `http://localhost:3000/api/like/list/${email}`
      );
      if (response.data.success) {
        console.log(response.data.likedSongs);
        setLikedsongs(response.data.likedSongs);
      }
    } catch (error) {
      toast.error("Error occurred while fetching liked songs.");
      console.error(error.message);
    }}
    
  };

  useEffect(() => {
    fetchPlaylists();
    fetchLikedSongs();
    
  }, [email]);


// handler for playlist click..................................................................................................................................................................

  const handlePlaylistClick = useCallback(
    (playlistId, playlistname, playlistimage) => {
      setPlaylistImage(playlistimage);
      navigate(`/playlist/display/${playlistId}/${playlistname}`);
    },
    [setPlaylistImage, navigate]
  );

  const handleLikedSongsClick = useCallback(() => {
    setShowLikedSongs(true);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <div className="w-16 h-16 border-4 border-gray-400 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-b from-gray-900 to-black text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 mt-5">
        {showLikedSongs ? "Liked Songs" : "Your Playlists"}
      </h1>
      {!showLikedSongs ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div
            className="relative bg-gradient-to-br from-purple-700 to-blue-500 text-white p-4 rounded-lg shadow-lg cursor-pointer group"
            onClick={handleLikedSongsClick}
          >
            <div className="h-40 flex items-center justify-center mb-4">
              <FaHeart className="text-6xl" />
            </div>
            <p className="text-lg font-semibold">Liked Songs</p>
            <div className="absolute bottom-4 right-4 bg-green-500 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <FaPlay className="text-white" />
            </div>
          </div>
          {data.map((item) => (
            <div
              key={item._id}
              className="relative bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-lg shadow-lg cursor-pointer group"
              onClick={() =>
                handlePlaylistClick(item._id, item.name, item.image)
              }
            >
              <img
                className="w-full h-40 object-cover rounded-lg mb-4"
                src={item.image}
                alt={item.name}
              />
              <p className="text-lg font-semibold truncate">{item.name}</p>
              <p className="text-sm text-gray-400 mt-1">
                {item.tracks.length} tracks
              </p>
              <div className="absolute bottom-4 right-4 bg-green-500 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <FaPlay className="text-white" />
              </div>
              <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playdjsongs(item);
                  }}
                  className={`bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 transition-all duration-300 ${
                    playMode === "dj" ? "ring-2 ring-green-500" : ""
                  }`}
                >
                  <FaRandom className="text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playSequentially(item.tracks);
                  }}
                  className={`bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 transition-all duration-300 ${
                    playMode === "playall" ? "ring-2 ring-green-500" : ""
                  }`}
                >
                  <FaPlay className="text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {userlikedsongs.map((song, index) => (
            <div
              key={index}
              onClick={() => playTrack([song], song)}
              className="bg-gray-800 text-white p-3 rounded-lg mb-4 flex items-center cursor-pointer hover:bg-gray-700 transition-transform transform hover:-translate-y-1"
            >
              <img
                src={song.image?.url}
                alt={song.name}
                className="w-12 h-12 object-cover rounded mr-3"
              />
              <div>
                <p className="text-lg font-semibold">{song.name}</p>
                <p className="text-sm">{song.artist}</p>
              </div>
              <FaHeart className="ml-auto text-red-500" />
            </div>
          ))}
          <button
            onClick={() => setShowLikedSongs(false)}
            className="bg-yellow-500 text-black px-4 py-2 rounded-full mt-4 hover:bg-yellow-400 transition"
          >
            Back to Playlists
          </button>
        </div>
      )}
    </div>
  );
};

export default ListPlaylist;
