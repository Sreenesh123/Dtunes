# 🎵 DTunes - Music Streaming Platform

DTunes is a social music streaming platform that lets you discover, share, and enjoy music with friends. It combines Spotify's music catalog with social features and AI-powered recommendations for a personalized listening experience.

## What it does

**Music Streaming**: Search and play millions of songs from Spotify, upload your own tracks, and create custom playlists.

**Social Features**: Connect with friends, see what they're listening to, and enjoy synchronized listening sessions together.

**Party Mode**: Host or join real-time listening parties where everyone hears the same music at the same time, perfectly synchronized.

**Smart Recommendations**: Get AI-powered song suggestions based on your listening history and preferences.

**Analytics**: Track your music habits with detailed statistics and visual charts of your favorite genres and artists.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **Real-time**: Socket.io for party mode synchronization
- **AI/ML**: Python Flask with scikit-learn for recommendations
- **External APIs**: Spotify Web API for music streaming

## 🚀 Quick Start

1. **Prerequisites**: Node.js, MongoDB, Python 3.8+, Spotify Developer Account

2. **Setup**:

   ```bash
   # Backend
   cd server && npm install && npm start

   # Frontend
   cd client && npm install && npm run dev

   # ML Service
   cd client/src/models && pip install flask flask-cors pymongo pandas scikit-learn
   python recommendation_api.py
   ```

3. **Configure**: Add your Spotify credentials and environment variables

4. **Access**: Open http://localhost:5173 and start exploring music!

---

**DTunes** - _Bringing people together through music_ 🎵
