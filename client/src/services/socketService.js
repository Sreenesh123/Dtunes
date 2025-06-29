import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.partyId = null;
    this.username = null;
    this.syncInterval = null;
    this.callbacks = {
      partyState: () => {},
      trackChange: () => {},
      playbackState: () => {},
      seekUpdate: () => {},
      seekBarColorUpdate: () => {},
      syncResponse: () => {},
      error: () => {},
    };
  }

  connect() {
    if (!this.socket) {
      this.socket = io("http://localhost:3000", {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on("connect", () => {
        console.log("Connected to socket server with ID:", this.socket.id);
      });

      this.socket.on("disconnect", () => {
        console.log("Disconnected from socket server");
      });

      this.socket.on("connect_error", (error) => {
        console.error("Connection error:", error);
        this.callbacks.error("Failed to connect to the server");
      });

      this.socket.on("partyState", (state) => {
        console.log("Received party state:", state);
        this.callbacks.partyState(state);
      });

      this.socket.on("trackChange", (track) => {
        console.log("Track change:", track);
        this.callbacks.trackChange(track);
      });

      this.socket.on("playbackState", (state) => {
        console.log("Playback state update:", state);
        this.callbacks.playbackState(state);
      });

      this.socket.on("seekUpdate", (position) => {
        console.log("Seek update:", position);
        this.callbacks.seekUpdate(position);
      });

      this.socket.on("seekBarColorUpdate", (color) => {
        console.log("Seek bar color update:", color);
        this.callbacks.seekBarColorUpdate(color);
      });

      this.socket.on("syncResponse", (state) => {
        console.log("Sync response:", state);
        this.callbacks.syncResponse(state);
      });
    }
    return this;
  }

  disconnect() {
    if (this.socket) {
      this.leaveParty();
      this.socket.disconnect();
      this.socket = null;
      this.stopSync();
    }
  }

  joinParty(partyId, username) {
    if (!this.socket) this.connect();

    this.partyId = partyId;
    this.username = username;
    this.socket.emit("joinParty", partyId, username);
    this.startSync();
    return this;
  }

  leaveParty() {
    if (this.socket && this.partyId) {
      this.socket.emit("leaveParty", this.partyId);
      this.partyId = null;
      this.stopSync();
    }
    return this;
  }

  playTrack(track) {
    if (this.socket && this.partyId) {
      this.socket.emit("playTrack", this.partyId, track);
    }
    return this;
  }

  controlPlayback(isPlaying, position = undefined) {
    if (this.socket && this.partyId) {
      this.socket.emit("playbackControl", this.partyId, {
        isPlaying,
        position,
      });
    }
    return this;
  }

  seekToPosition(position) {
    if (this.socket && this.partyId) {
      this.socket.emit("seekPosition", this.partyId, position);
    }
    return this;
  }

  updateSeekBarColor(colorGradient) {
    if (this.socket && this.partyId) {
      this.socket.emit("updateSeekBarColor", this.partyId, colorGradient);
    }
    return this;
  }

  on(event, callback) {
    if (this.callbacks.hasOwnProperty(event)) {
      this.callbacks[event] = callback;
    }
    return this;
  }

  startSync() {
    this.stopSync();
    this.syncInterval = setInterval(() => {
      if (this.socket && this.partyId) {
        this.socket.emit("syncRequest", this.partyId);
      }
    }, 3000); 
    return this;
  }

  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    return this;
  }

  getSocket() {
    return this.socket;
  }

  isInParty() {
    return this.socket && this.socket.connected && this.partyId !== null;
  }
}

const socketService = new SocketService();
export default socketService;
