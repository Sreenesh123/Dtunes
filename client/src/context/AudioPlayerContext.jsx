import React, { createContext, useState, useRef, useEffect,useContext } from "react";
import { PlayerContext } from "./PlayerContext";


export const AudioPlayerContext = createContext();

const AudioPlayerProvider = ({ children }) => {

  const [selectedTrack, setSelectedTrack] = useState(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef(null);
const {

  setAudioPlayer,
  audioPlayer,setPlayStatus,playStatus

} = useContext(PlayerContext);
  useEffect(() => {
    const audio = new Audio();
    setAudioPlayer(audio);

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime * 1000); 
    });

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration * 1000); 
    });

    return () => {
      clearInterval(intervalRef.current);
      audio.pause();
      audio.src = "";
      audio.removeEventListener("timeupdate", () => {});
      audio.removeEventListener("loadedmetadata", () => {});
    };
  }, []);

  const playTrack = (track) => {
    setSelectedTrack(track);

    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.src = track.preview_url;
      audioPlayer.play();
      setPlayStatus(true);
    }
  };

  const pauseTrack = () => {
    if (audioPlayer) {
      audioPlayer.pause();
      setPlayStatus(false);
    }
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        audioPlayer,
        selectedTrack,
        playStatus,
        currentTime,
        duration,
        playTrack,
        pauseTrack,
        setPlayStatus,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export default AudioPlayerProvider;
