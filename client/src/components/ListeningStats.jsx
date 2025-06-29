
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { PlayerContext } from "../context/PlayerContext";
import apiClient from "../spotify";

ChartJS.register(ArcElement, Tooltip, Legend);

const ListeningStats = ({ period }) => {
  const {
    setSelectedTrack,
    embedController,
    selectedTrack,
    setSongsData,
    setTrack,
    loading,
    setLoading,
    email,
  } = useContext(PlayerContext);

  const [stats, setStats] = useState([]);
  const [genreStats, setGenreStats] = useState({});
  const [artistStats, setArtistStats] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [newartistdata, setnewartistdata] = useState([]);

  useEffect(() => {
    fetchListeningStats();
  }, [email, period]);

  useEffect(() => {
    if (stats.length > 0 && artistStats.length > 0) {
        console.log("hello shit");
      fetchRecommendations();
    }
  }, [selectedTrack, stats, artistStats]);

  const fetchListeningStats = async () => {
    console.log("fetching listening stats");
    try {
      const response = await axios.get(
        `http://localhost:3000/api/song/listening-stats/${email}?period=${period}`
      );
      console.log(response.data);
      setStats(response.data);
      calculateGenreStats(response.data);
      calculateArtistStats(response.data);
    } catch (error) {
      console.error("Error fetching listening stats:", error);
    }
  };

  const calculateGenreStats = (data) => {
    const genres = {};
    data.forEach((stat) => {
      const genre = stat.genre || "Unknown";
      if (genres[genre]) {
        genres[genre] += stat.count;
      } else {
        genres[genre] = stat.count;
      }
    });
    setGenreStats(genres);
  };

  const calculateArtistStats = (data) => {
    const artists = {};
    data.forEach((stat) => {
      if (artists[stat.track.artist]) {
        artists[stat.track.artist] += stat.count;
      } else {
        artists[stat.track.artist] = stat.count;
      }
    });
    console.log(artistStats);
    const sortedArtists = Object.entries(artists)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    setArtistStats(sortedArtists);
  };

//   const fetchRecommendations = async () => {
//     console.log("fetching recommendation");
//     try {
//       setLoading(true);

//       // Get the top track from listening stats
//       const topTrack = stats[0]?.track;

//       if (topTrack) {
//         // Fetch recommendations from your custom API
//         const response = await axios.get(
//           `http://localhost:5000/recommendations?track_id=${topTrack.id}`,
//           {method: "GET",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             credentials:"include",
//           }
        
//         );

//         console.log(response.data);

//         // Map the response to match your existing data structure
//         const newRecommendations = response.data.map((trackId) => {
//           const track = stats.find((stat) => stat.track.id === trackId);
//           return {
//             _id: trackId,
//             name: track?.track.name || "Unknown",
//             artist: track?.track.artist || "Unknown",
//             image: track?.track.image || "default_image_url",
//             uri: track?.track.uri || "#",
//             preview_url: track?.track.preview_url || null,
//           };
//         });

//         setRecommendations(newRecommendations);
//         setSongsData(newRecommendations);
//       }
//     } catch (error) {
//       console.error("Error fetching recommendations:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

const fetchRecommendations = async () => {
  console.log("Fetching recommendations...");
  try {
    setLoading(true);

    const topTrack = stats[0]?.track;

    if (!topTrack) {
      console.warn("No top track found.");
      return;
    }

    const response = await axios.get(
      `http://localhost:5000/recommendations?track_id=${topTrack.id}`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log("Recommended Track IDs:", response.data);

    if (!Array.isArray(response.data)) {
      console.error("Invalid response format:", response.data);
      return;
    }

    const newRecommendations = response.data.map((trackId) => {
      const trackData = stats.find((stat) => stat.track.id === trackId)?.track;

      return {
        _id: trackId,
        name: trackData?.name || "Unknown Song",
        artist: trackData?.artist || "Unknown Artist",
        image: trackData?.image || "default_image_url",
        uri: trackData?.uri || "#",
        preview_url: trackData?.preview_url || null,
      };
    });
    
    console.log(newRecommendations);

    setRecommendations(newRecommendations);
    setSongsData(newRecommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
  } finally {
    setLoading(false);
  }
};

  const playRecommendation = (track, index) => {
    setSelectedTrack(track);
    setSongsData(recommendations);
    setTrack(track);
  };

  useEffect(() => {
    console.log(newartistdata);
  }, [newartistdata]);

  const chartData = {
    labels: Object.keys(genreStats),
    datasets: [
      {
        data: Object.values(genreStats),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#E5E7EB",
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="grid place-items-center min-h-[80vh] bg-gray-900">
        <div className="w-16 h-16 border-4 border-gray-600 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-100">Listening Stats</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-200">
            Top Tracks
          </h3>
          <ul className="space-y-4">
            {stats.slice(0, 5).map((stat, index) => (
              <li
                key={index}
                className="flex items-center bg-gray-700 rounded-lg p-3 transition duration-300 hover:bg-gray-600"
              >
                <img
                  src={stat.track.image}
                  alt={stat.track.name}
                  className="w-16 h-16 rounded-md object-cover mr-4"
                />
                <div>
                  <h3 className="font-semibold text-lg text-gray-100">
                    {stat.track.name}
                  </h3>
                  <p className="text-gray-300">{stat.track.artist}</p>
                  <p className="text-sm text-gray-400">
                    Genre: {stat.genre || "Unknown"} | Listened: {stat.count}{" "}
                    times
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-[100%] flex flex-col justify-center items-center">
          <h3 className="text-xl font-semibold mb-4 text-gray-200">
            Favorite Artists
          </h3>
          <ul className="space-y-4 w-[100%] flex flex-col items-center">
            {newartistdata.map((item, index) => (
              <li
                key={index}
                className="flex w-[75%] items-center justify-between bg-gray-700 rounded-lg p-3 transition duration-300 hover:bg-gray-600"
              >
                <img
                  src={item[2]}
                  alt=""
                  className="w-16 h-16 rounded-md object-cover mr-4"
                />
                <span className="text-gray-100 font-semibold">{item[0]}</span>
                <span className="text-gray-400">{item[1]} plays</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-20">
        <h3 className="text-xl font-semibold mb-4 text-center text-gray-200">
          Genre Distribution
        </h3>
        <div className="max-w-md mx-auto">
          <Pie data={chartData} options={chartOptions} />
        </div>
      </div>
      <div className="mt-20">
        <h3 className="text-xl font-semibold mb-4 text-gray-200">
          Recommended Tracks
        </h3>
        <ul className="space-y-4">
          {recommendations.map((track, index) => (
            <li
              key={`${track._id}-${index}`}
              className={`flex items-center bg-gray-700 rounded-lg p-3 transition duration-300 hover:bg-gray-600 cursor-pointer ${
                track.uri === selectedTrack?.uri
                  ? "border-2 border-green-500"
                  : ""
              }`}
              onClick={() => playRecommendation(track, index)}
            >
              <img
                src={track.image}
                alt={track.name}
                className="w-16 h-16 rounded-md object-cover mr-4"
              />
              <div>
                <h3 className="font-semibold text-lg text-gray-100">
                  {track.name}
                </h3>
                <p className="text-gray-300">{track.artist}</p>
              </div>
              {track.uri === selectedTrack?.uri && (
                <span className="ml-auto text-green-500">Now Playing</span>
              )}
            </li>
          ))}
        </ul>
        {loading && (
          <p className="text-center mt-4 text-gray-300">
            Loading recommendations...
          </p>
        )}
      </div>
    </div>
  );
};

export default ListeningStats;