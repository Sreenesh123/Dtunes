import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { PlayerContext } from "../context/PlayerContext";
import apiClient from "../spotify";

ChartJS.register(ArcElement, Tooltip, Legend);

const ListeningStats = ({ email, period }) => {
  const {
    setSelectedTrack,
    embedController,
    selectedTrack,
    setSongsData,
    setTrack,
    setselectedTrackData,
  } = useContext(PlayerContext);
  const [stats, setStats] = useState([]);
  const [genreStats, setGenreStats] = useState({});
  const [artistStats, setArtistStats] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchListeningStats();
  }, [email, period]);

  useEffect(() => {
    if (stats.length > 0 && artistStats.length > 0) {
      fetchRecommendations();
    }
  }, [stats, artistStats]);

  const fetchListeningStats = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/song/listening-stats/${email}?period=${period}`
      );
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
    const sortedArtists = Object.entries(artists)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    setArtistStats(sortedArtists);
  };

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const topTrack = stats[0]?.track;
      const topArtists = artistStats.slice(0, 2).map(([artist]) => artist);

      if (topTrack && topArtists.length > 0) {
        const artistResponses = await Promise.all(
          topArtists.map((artist) =>
            apiClient.get("search", {
              params: {
                q: artist,
                type: "artist",
                limit: 1,
              },
            })
          )
        );
        const artistIds = artistResponses
          .map((response) => response.data.artists.items[0]?.id)
          .filter((id) => id);

        const response = await apiClient.get("recommendations", {
          params: {
            seed_tracks: topTrack.id,
            seed_artists: artistIds.join(","),
            limit: 10,
          },
        });
        const newRecommendations = response.data.tracks.map((track) => ({
          _id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          image: track.album.images[0].url,
          uri: track.uri,
        }));
        setRecommendations(newRecommendations);
        setSongsData(newRecommendations);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const playRecommendation = (track, index) => {
    console.log(track)
    setSelectedTrack(track);
    // setselectedTrackData(track);
    setTrack(track);

    if (embedController) {
      embedController.loadUri(track.uri);

      embedController.addListener("playback_update", ({ data }) => {
        if (data.position === data.duration) {
          const nextIndex = (index + 1) % recommendations.length;
          playRecommendation(recommendations[nextIndex], nextIndex);
        }
      });
    }
  };

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

  return (
    <div className=" bg-gradient-to-b from-gray-900 to-black rounded-lg shadow-md p-6">
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
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-200">
            Favorite Artists
          </h3>
          <ul className="space-y-4">
            {artistStats.map(([artist, count], index) => (
              <li
                key={index}
                className="flex items-center justify-between bg-gray-700 rounded-lg p-3 transition duration-300 hover:bg-gray-600"
              >
                <span className="text-gray-100 font-semibold">{artist}</span>
                <span className="text-gray-400">{count} plays</span>
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
      <div id="embed-iframe" className="w-0 h-0 invisible hidden"></div>
    </div>
  );
};

export default ListeningStats;
