import React, { useEffect, useState } from "react";
import axios from "axios";


const FriendsCurrentTracks = ({ email }) => {
  const [friendsTracks, setFriendsTracks] = useState([]);
  const [newfriendsTracks, setnewFriendsTracks] = useState([]);
  
  console.log(email)

  useEffect(() => {
    const fetchFriendsTracks = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/song/friendsCurrentTracks/${email}`
        );
        
        setFriendsTracks(response.data.friendsCurrentTracks);
        
      } catch (error) {
        console.error("Error fetching friends' current tracks:", error);
      }
    };

     const intervalId = setInterval(fetchFriendsTracks, 5000);
     return () => clearInterval(intervalId);
  }, [email]);

   useEffect(() => {
   setnewFriendsTracks(friendsTracks)
   }, [friendsTracks]);

  return (
    <div className="friends-tracks p-4 bg-gray-800 rounded-lg shadow-lg overflow-auto">
      <h2 className="text-2xl font-bold text-white mb-4 overflow-auto">
        Friends' Current Tracks
      </h2>
      <ul className="space-y-4 overflow-auto">
        {newfriendsTracks.length>0 && newfriendsTracks.map((track, index) => {
            return (
              <li
                key={index}
                className="track-item flex flex-col  bg-gray-700 p-3 rounded-lg"
              >
                <div>
                  <p>{track.username}</p>
                </div>
                <div className="flex flex-row mt-6 ">
                  <img
                    src={track.currentPlayingTrack.image}
                    className="w-16 h-16 rounded-md mr-4"
                  />
                  <div>
                    <p className="text-white font-semibold">
                      {track.currentPlayingTrack.name}
                    </p>
                  </div>
                </div>
              </li>
            );
})}
      </ul>
    </div>
  );
};

export default FriendsCurrentTracks;
