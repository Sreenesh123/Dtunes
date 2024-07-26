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
  const [time, setTime] = useState({
    currentTime: { second: 0, minute: 0 },
    totalTime: { second: 0, minute: 0 },
  });

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

 const playWithId = async (id, tracks = null) => {
   try {
     console.log("playing with id ", id);

     const songsToUse = tracks || songsData;
     console.log("Songs to use:", songsToUse);

     const track = Array.from(songsToUse).find((item) => item._id === id);
     console.log("Track found:", track);

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

  const next = async () => {
    const currentIndex = songsData.findIndex((item) => item._id === Track._id);
    if (currentIndex < songsData.length - 1) {
      const nextTrack = songsData[currentIndex + 1];
      setTrack(nextTrack);
      setselectedTrackData(nextTrack);

      if (embedController) {
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
  };

  const previous = async () => {
    const currentIndex = songsData.findIndex((item) => item._id === Track._id);
    if (currentIndex > 0) {
      const previousTrack = songsData[currentIndex - 1];
      setTrack(previousTrack);
      setselectedTrackData(previousTrack);

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

  const seekSong = async (e) => {
    try {
      if (!seekBg.current) {
        console.error("seekBg reference is not set.");
        return;
      }

      const rect = seekBg.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const percentage = offsetX / seekBg.current.offsetWidth;

      console.log("Seeking position percentage:", percentage);

      let seekPosition;

      if (embedController) {
        console.log("Seeking with embed controller");
        seekPosition = percentage * (currentDuration / 1000);
        console.log(currentDuration);
        console.log("Calculated seek position (embed):", seekPosition);
        await embedController.seek(seekPosition);
      } else if (selectedTrackData && audioPlayer) {
        if (!isNaN(audioPlayer.duration)) {
          seekPosition = percentage * audioPlayer.duration;
          console.log("Calculated seek position (audioPlayer):", seekPosition);
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

  const getAlbumsData = async () => {
  };
 const getSongsData = async () => {
  };

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

  const updateSeekBar = useCallback(() => {
    console.log("Updating seek bar");
    if (seekBar.current) {
      let currentTime, duration;

      if (embedController && currentDuration > 0) {
        currentTime = currentPosition / 1000;
        duration = currentDuration / 1000;
      } else if (selectedTrackData && audioPlayer) {
        console.log("entered audioplayer");
        console.log(audioPlayer.duration)
        if (!isNaN(audioPlayer.duration)) {
          console.log(audioPlayer.duration)
          currentTime = audioPlayer.currentTime;
          duration = audioPlayer.duration;
          console.log("Duration:", duration, "Current Time:", currentTime);
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
        console.log("Width Percentage:", widthPercentage);
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedEmail = localStorage.getItem("email");

    if (token && storedEmail) {
      console.log("Retrieved token:", token);
      setClientToken(token);
      setEmail(storedEmail);
    } else {
      console.error("No token or email found.");
    }
  }, []);

  useEffect(() => {
    if (selectedTrack) {
      const script = document.createElement("script");
      script.src = "https://open.spotify.com/embed-podcast/iframe-api/v1";
      script.async = true;

      document.body.appendChild(script);

      script.onload = () => {
        window.onSpotifyIframeApiReady = (IFrameAPI) => {
          console.log(selectedTrack);
          const element = document.getElementById("embed-iframe");
          if (element) {
            const options = {
              width: "0%",
              height: "0",
              uri: selectedTrack.uri,
            };
            IFrameAPI.createController(element, options, (EmbedController) => {
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
                console.log("Embedded player ready");
              });
            });
          }
        };
      };

      return () => {
        if (embedController) {
          embedController.destroy();
        }
        document.body.removeChild(script);
      };
    }
  }, [selectedTrack]);

  useEffect(() => {
    let intervalId;

    if (embedController) {
      embedController.addListener("playback_update", (e) => {
        setCurrentPosition(e.data.position);
        setCurrentDuration(e.data.duration);
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
    console.log("Current Duration changed:", currentDuration);
    updateSeekBar();
  }, [currentDuration, updateSeekBar]);

  useEffect(() => {
    getAlbumsData();
    getSongsData();
  }, []);

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
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {props.children}
    </PlayerContext.Provider>
  );
};

export default PlayerContextProvider;
