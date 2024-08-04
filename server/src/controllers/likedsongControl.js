
import { User } from "../models/User.js"; 

const addLikedSong = async (req, res) => {
  const likedsong = req.body;
  const {email}=req.params

  try {
    const user = await User.findOne({email});
    user.likedsongs.push(likedsong);
    await user.save();
    res
      .status(201)
      .json({ success: true, message: "Song liked successfully!" });
  } catch (error) {
    console.error("Error adding liked song:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to like the song." });
  }
};

const removeLikedSong = async (req, res) => {
  const { uri } = req.params;
  const { email } = req.params;
  try {
    const user = await User.findOne({ email });
    user.likedsongs = user.likedsongs.filter((song) => song.uri !== uri);
    await user.save();

    res.json({ success: true, message: "Song removed from liked songs." });
  } catch (error) {
    console.error("Error removing liked song:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to remove the song." });
  }
};

const fetchLikedSongs = async (req, res) => {
  const { email } = req.params;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const likedSongs = user.likedsongs;

    res.status(200).json({
      success: true,
      message: "Liked songs fetched successfully",
      likedSongs,
    });
  } catch (error) {
    console.error("Error fetching liked songs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch liked songs.",
    });
  }
};

const checkLikedSong = async (req, res) => {
  const { id } = req.params;
  const { email } = req.params;
  try {
    const user = await User.findOne({ email });
    const liked = user.likedsongs.some((song) => song.id === id);
    res.json({ success: true, liked });
  } catch (error) {
    console.error("Error checking liked song:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to check liked status." });
  }
};



export { addLikedSong, removeLikedSong, checkLikedSong,fetchLikedSongs };
