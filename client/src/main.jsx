import React from 'react'
import axios from "axios";
axios.defaults.withCredentials = true;
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import PlayerContextProvider from './context/PlayerContext.jsx';
import AudioPlayerProvider from './context/AudioPlayerContext.jsx';


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <PlayerContextProvider>
        <AudioPlayerProvider>
          <App />
        </AudioPlayerProvider>
      </PlayerContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
