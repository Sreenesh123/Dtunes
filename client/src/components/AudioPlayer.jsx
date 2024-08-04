import React, { useEffect, useRef } from "react";
import { useAudioPlayer } from "./AudioPlayerContext";

const AudioPlayer = () => {
  const { audioPlayer, setAudioPlayer, currentTrack } = useAudioPlayer();
  const intervalRef = useRef(null);

  useEffect(() => {
    const audio = new Audio();
    setAudioPlayer(audio);

    return () => {
      clearInterval(intervalRef.current);
      audio.pause();
      audio.src = "";
    };
  }, []);

  useEffect(() => {
    if (audioPlayer) {
      audioPlayer.addEventListener("timeupdate", handleTimeUpdate);
      audioPlayer.addEventListener("ended", handleTrackEnded);
    }

    return () => {
      if (audioPlayer) {
        audioPlayer.removeEventListener("timeupdate", handleTimeUpdate);
        audioPlayer.removeEventListener("ended", handleTrackEnded);
      }
    };
  }, [audioPlayer]);

  const handleTimeUpdate = () => {
    
  };

  const handleTrackEnded = () => {
   
  };

  return null; 
};

export default AudioPlayer;
