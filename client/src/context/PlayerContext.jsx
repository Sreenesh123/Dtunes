import { createContext, useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { setClientToken } from "../spotify";
import apiClient from "../spotify";
const url = "http://localhost:3000";

export const PlayerContext = createContext();

const PlayerContextProvider = (props) => {
  const audioRef = useRef();
  const seekBg = useRef();
  const seekBar = useRef();
  const sourceRef = useRef();
  const [email, setEmail] = useState("");
  const [songsData, setSongsData] = useState([]);
  const [liked, setLiked] = useState(false);
  const [albumsData, setAlbumsData] = useState([]);
  const [Track, setTrack] = useState(null);
  const [playStatus, setPlayStatus] = useState(false);
  const [selectedTrackData, setselectedTrackData] = useState(null);
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [embedController, setEmbedController] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [likedSongs, setLikedSongs] = useState([]);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [spotifyIFrameAPI, setSpotifyIFrameAPI] = useState(null);
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [isSpotifyTrack, setIsSpotifyTrack] = useState(false);
  const [playlistimage,setPlaylistImage]=useState("")
  const [playMode, setPlayMode] = useState("none");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dauthtoken,setdauthtoken]=useState("")
  const [time, setTime] = useState({
    currentTime: { second: 0, minute: 0 },
    totalTime: { second: 0, minute: 0 },
  });


 useEffect(() => {
   console.log("PlayerContextProvider mounted");
   return () => {
     console.log("PlayerContextProvider unmounted");
   };
 }, []);


// handling verification of user using tokens...........................................................................................................................................

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true, 
});

  const verifyUser = async () => {
    try {
        console.log("entered verification")
       const token = localStorage.getItem("dauthtoken");
       const headers = {};
       if (token) {
         headers["Authorization"] = `Bearer ${token}`;
       }
       const response = await api.get("/auth/verify", { headers });
      if (response.data.status) {
        console.log("verification success")
        const spotifyTokenResponse = await axios.get(
          "http://localhost:3000/auth/spotify/token"
        );
        setClientToken(spotifyTokenResponse.data.access_token);
        setSpotifyToken(spotifyTokenResponse.data.access_token);
        setIsAuthenticated(true);
        setEmail(response.data.email);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    verifyUser();
  }, []);
  


//  handling play and pause functionalities of the player............................................................................................................................

  const play = async () => {
    try {
      if (embedController) {
        console.log("entered embedplay");
        await embedController.resume();
      } else if (selectedTrackData && audioPlayer) {
        console.log("entered audioplayerplay");
        await audioPlayer.play();
      } else if (audioRef.current) {
        await audioRef.current.play();
      }
      setPlayStatus(true);
    } catch (error) {
      console.error("Error in play:", error);
    }
  };

   const pause = async () => {
     try {
       if (embedController) {
         console.log("entered embedpause");
         await embedController.pause();
       } else if (selectedTrackData && audioPlayer) {
         console.log("entered audioplayerpause");
         await audioPlayer.pause();
       } else if (audioRef.current) {
         await audioRef.current.pause();
       }
       setPlayStatus(false);
     } catch (error) {
       console.error("Error in pause:", error);
     }
   };

  const stopAudioPlayer = () => {
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (embedController) {
      embedController.pause()
      embedController.destroy();
    }
  };

//  playing songs that dont contain uri.....................................................................................................

  const playWithId = async (id, tracks = null) => {
    try {
      stopAudioPlayer()
      if(embedController)   
        {embedController.destroy(), 
          setEmbedController(null);
        } 
      const songsToUse = tracks || songsData;
      const track = Array.from(songsToUse).find((item) => item._id === id);
      if (track) {
        setTrack(track);
        setselectedTrackData(track);
        const playAudio = async (audioElement) => {
          try {
            if (!audioElement.paused) {
              await audioElement.pause();
            }
            audioElement.src = track.preview_url
              ? track.preview_url
              : track.file;
            await audioElement.load();
            await audioElement.play();
            setPlayStatus(true);
          } catch (error) {
            console.error("Error playing audio:", error);
            setPlayStatus(false);
          }
        };

        if (audioPlayer) {
          await playAudio(audioPlayer);
        } else if (audioRef.current) {
          await playAudio(audioRef.current);
        }
      } else {
        console.error("Track not found");
      }
    } catch (error) {
      console.error("Error in playWithId:", error);
    }
  };

// functionalities to play next and previous songs.......................................................................................................................................................

  const next = async () => {
    let currentIndex = songsData.findIndex((item) => item._id === Track._id);
    if (currentIndex < songsData.length - 1) {
      const nextTrack = songsData[currentIndex + 1];
      setTrack(nextTrack);
      setselectedTrackData(nextTrack);
      if(playMode!=="dj"){
      setSelectedTrack(nextTrack);}

      if (embedController) {
        console.log("playing with embed")
        await embedController.loadUri(nextTrack.uri);
      } else if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.src = nextTrack.preview_url
          ? nextTrack.preview_url
          : nextTrack.file;
        await audioPlayer.load();
        await audioPlayer.play();
      } else if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = nextTrack.preview_url
          ? nextTrack.preview_url
          : nextTrack.file;
        await audioRef.current.load();
        await audioRef.current.play();
      }
      setPlayStatus(true);
    }
    else{
      currentIndex=0
      if(playMode!=="dj"){
setSelectedTrack(songsData[currentIndex]);
      }
      else{
        console.log("playing with id");
        playWithId(songsData[currentIndex]._id);
      }
      
      setTrack(songsData[currentIndex]);
      
      
    }
  };

  const previous = async () => {
    const currentIndex = songsData.findIndex((item) => item._id === Track._id);
    if (currentIndex > 0) {
      const previousTrack = songsData[currentIndex - 1];
      setTrack(previousTrack);
      setselectedTrackData(previousTrack);
       if (playMode !== "dj") {
         setSelectedTrack(previousTrack);
       }
      if (embedController) {
        await embedController.loadUri(previousTrack.uri);
      } else if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.src = previousTrack.preview_url
          ? previousTrack.preview_url
          : previousTrack.file;
        await audioPlayer.load();
        await audioPlayer.play();
      } else if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = previousTrack.preview_url
          ? previousTrack.preview_url
          : previousTrack.file;
        await audioRef.current.load();
        await audioRef.current.play();
      }

      setPlayStatus(true);
    }
  };


// to play the song from the point where the seerkbar is clicked.......................................................................................................................

  const seekSong = async (e) => {
    try {
      if (!seekBg.current) {
        console.error("seekBg reference is not set.");
        return;
      }

      const rect = seekBg.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const percentage = offsetX / seekBg.current.offsetWidth;
      let seekPosition;

      if (embedController) {
        seekPosition = percentage * (currentDuration / 1000);
        await embedController.seek(seekPosition);
      } else if (selectedTrackData && audioPlayer) {
        if (!isNaN(audioPlayer.duration)) {
          seekPosition = percentage * audioPlayer.duration;
          audioPlayer.currentTime = seekPosition;
        } else {
          console.error("Audio player duration is not available yet");
        }
      } else if (audioRef.current) {
        if (!isNaN(audioRef.current.duration)) {
          seekPosition = percentage * audioRef.current.duration;
          console.log("Calculated seek position (audioRef):", seekPosition);
          audioRef.current.currentTime = seekPosition;
        } else {
          console.error("Audio reference duration is not available yet");
        }
      } else {
        console.error("No audio player or embed controller available.");
        return;
      }

      updateSeekBar();

      if (!playStatus) {
        play();
      }
    } catch (error) {
      console.error("Error seeking:", error);
    }
  };


  const updateSeekBar = useCallback(() => {
    if (seekBar.current) {
      let currentTime, duration;

      if (embedController && currentDuration > 0) {
        currentTime = currentPosition / 1000;
        duration = currentDuration / 1000;
      } else if (selectedTrackData && audioPlayer) {
        if (!isNaN(audioPlayer.duration)) {
          currentTime = audioPlayer.currentTime;
          duration = audioPlayer.duration;

          if (audioPlayer.currentTime > 28 && playMode === "dj") {
            next();
          }
        } else {
          console.log("Audio player duration is not available yet");
          return;
        }
      } else if (audioRef.current) {
        if (!isNaN(audioRef.current.duration)) {
          currentTime = audioRef.current.currentTime;
          duration = audioRef.current.duration;
        } else {
          console.log("Audio reference duration is not available yet");
          return;
        }
      }

      if (duration > 0) {
        const widthPercentage = (currentTime / duration) * 100;
        seekBar.current.style.width = `${widthPercentage}%`;
        setTime({
          currentTime: {
            second: Math.floor(currentTime % 60),
            minute: Math.floor(currentTime / 60),
          },
          totalTime: {
            second: Math.floor(duration % 60),
            minute: Math.floor(duration / 60),
          },
        });
      }
    }
  }, [
    currentPosition,
    currentDuration,
    embedController,
    selectedTrackData,
    audioPlayer,
    audioRef,
  ]);


  const getAlbumsData = async () => {
  };

  const getSongsData = async () => {
  };

// functions used for playing the featured playlist from spotify.............................................................................................................................

  const getPlaylistTracks = async (playlistId) => {
    try {
      const response = await axios.get(
        `${url}/api/playlist/${playlistId}/tracks`
      );
      setSongsData(response.data.tracks);
      setTrack(response.data.tracks[0]);
    } catch (error) {
      console.error("Error fetching playlist tracks:", error);
    }
  };

  const setAndPlayPlaylist = (tracks) => {
    setSongsData(tracks);
    setTrack(tracks[0]);
    setselectedTrackData(tracks[0]);
    setSelectedTrack(tracks[0]);
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.src = tracks[0].preview_url;
      audioPlayer.play();
    } else if (audioRef.current) {
      audioRef.current.src = tracks[0].preview_url;
      audioRef.current.play();
    }
    setPlayStatus(true);
  };

// .................................................................................................................................................................


  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed-podcast/iframe-api/v1";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.onSpotifyIframeApiReady = (IFrameAPI) => {
        setSpotifyIFrameAPI(IFrameAPI);
      };
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    console.log(selectedTrack,spotifyIFrameAPI)
    if (selectedTrack && spotifyIFrameAPI) {
      initializeEmbedController();
    }
  }, [selectedTrack, spotifyIFrameAPI]);

  const initializeEmbedController = () => {
    const element = document.getElementById("embed-iframe");
    console.log(element)
    if(element==null && embedController)
    {
      embedController.loadUri(selectedTrack.uri)
    }
    if (element && spotifyIFrameAPI) {
      stopAudioPlayer()
      if (embedController) {
        embedController.destroy();
      }
      const options = {
        width: "0%",
        height: "0",
        uri: selectedTrack.uri,
      };
      spotifyIFrameAPI.createController(element, options, (EmbedController) => {
        setEmbedController(EmbedController);
        EmbedController.addListener("playback_update", (e) => {
          setCurrentTime(e.data.position);
          setDuration(e.data.duration);
          setTime({
            currentTime: {
              second: Math.floor((e.data.position / 1000) % 60),
              minute: Math.floor(e.data.position / 1000 / 60),
            },
            totalTime: {
              second: Math.floor((e.data.duration / 1000) % 60),
              minute: Math.floor(e.data.duration / 1000 / 60),
            },
          });
        });
        EmbedController.addListener("ready", () => {
          EmbedController.play();
          setPlayStatus(true);
        });
      });
    }
  };

  useEffect(() => {
    let intervalId;
    if (embedController) {
      embedController.addListener("playback_update", (e) => {
        setCurrentPosition(e.data.position);
        setCurrentDuration(e.data.duration);
        if(songsData.length>0 && e.data.position===e.data.duration)
        {
          next()
        }
      });
    } else {
      intervalId = setInterval(updateSeekBar, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (embedController) {
        embedController.removeListener("playback_update");
      }
    };
  }, [embedController, updateSeekBar]);

  useEffect(() => {
    updateSeekBar();
  }, [currentDuration, updateSeekBar]);

//   useEffect(() => {
//     getAlbumsData();
//     getSongsData();
//   }, []);

  useEffect(() => {  
    const handleEnded = () => {
      next();
    };

    if (audioRef.current) {
      audioRef.current.addEventListener("ended", handleEnded);
    }
    if (audioPlayer) {
      audioPlayer.addEventListener("ended", handleEnded);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", handleEnded);
      }
      if (audioPlayer) {
        audioPlayer.removeEventListener("ended", handleEnded);
      }
    };
  }, [audioRef, audioPlayer, next]);

  const contextValue = {
    audioRef,
    seekBg,
    seekBar,
    Track,
    setTrack,
    playStatus,
    setPlayStatus,
    time,
    setTime,
    play,
    pause,
    playWithId,
    next,
    previous,
    seekSong,
    songsData,
    albumsData,
    setSongsData,
    selectedTrackData,
    setselectedTrackData,
    embedController,
    setEmbedController,
    sourceRef,
    audioPlayer,
    setAudioPlayer,
    setEmail,
    email,
    likedSongs,
    setLikedSongs,
    liked,
    setLiked,
    getPlaylistTracks,
    setAndPlayPlaylist,
    currentTime,
    setCurrentTime,
    selectedTrack,
    setSelectedTrack,
    duration,
    setDuration,
    playlistimage,setPlaylistImage,playMode,setPlayMode,isAuthenticated,setIsAuthenticated,loading,setLoading,verifyUser,spotifyToken
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {props.children}
    </PlayerContext.Provider>
  );
};

export default PlayerContextProvider;
