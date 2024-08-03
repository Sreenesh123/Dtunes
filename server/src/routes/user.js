import express from "express";
import bcrypt from "bcrypt";
const router = express.Router();
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return res.json({ message: "user already existed" });
  }

  const hashpassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    username,
    email,
    password: hashpassword,
  });

  await newUser.save();
  return res.json({ status: true, message: "record registered" });
});

router.post("/login", async (req, res) => {
  console.log("login entered");
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: "user is not registered" });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.json({ message: "password is incorrect" });
  }

  const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
    expiresIn: "8h",
  });

  res.cookie("token", token, { httpOnly: true, maxAge: 28800000 });

  return res.json({ status: true, message: "login successfully" });
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "user not registered" });
    }
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "5m",
    });

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "sreenesh2006@gmail.com",
        pass: "sini ygqo cpha zzjn",
      },
    });
    const encodedToken = encodeURIComponent(token).replace(/\./g, "%2E");
    var mailOptions = {
      from: "sreenesh2006@gmail.com",
      to: email,
      subject: "Reset Password",
      text: `http://localhost:5173/resetPassword/${encodedToken}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return res.json({ message: "error sending email" });
      } else {
        return res.json({ status: true, message: "email sent" });
      }
    });
  } catch (err) {
    console.log(err);
  }
});

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const decoded = await jwt.verify(token, process.env.SECRET_KEY);
    const id = decoded.id;
    const hashPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate({ _id: id }, { password: hashPassword });
    return res.json({ status: true, message: "updated password" });
  } catch (err) {
    return res.json("invalid token");
  }
});

const verifyUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.json({ status: false, message: "not authenticated" });
    }
    const decoded = await jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.json({ status: false, message: "invalid authentication" });
    }
    req.user = { email: user.email, userId: user._id };
    next();
  } catch (err) {
    return res.json({ status: false, message: "invalid token" });
  }
};

router.get("/verify", verifyUser, (req, res) => {
  return res.json({
    status: true,
    message: "authorized",
    email: req.user.email,
  });
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.clearCookie("email");
  return res.json({ status: true, message: "logged out successfully" });
});

const getSpotifyToken = async () => {
  const clientId = "8a1e1e24de3f4925a4cd2b37d017f1d6";
  const clientSecret = "6309991937a94898ad2d72fc72bf94a7";

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "client_credentials",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${clientId}:${clientSecret}`
          ).toString("base64")}`,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("Error getting Spotify token:", error);
    throw error;
  }
};

router.get("/spotify/token", async (req, res) => {
  try {
    console.log("Spotify token request for user:");
    const spotifyToken = await getSpotifyToken();
    res.json({ access_token: spotifyToken });
  } catch (error) {
    console.error("Error getting Spotify token:", error);
    res.status(500).json({ error: "Failed to get Spotify token" });
  }
});

router.get("/spotify/search", async (req, res) => {
  try {
    const { q, type } = req.query;
    const spotifyToken = await getSpotifyToken();

    const response = await axios.get("https://api.spotify.com/v1/search", {
      params: { q, type },
      headers: { Authorization: `Bearer ${spotifyToken}` },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error proxying Spotify request:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching data from Spotify" });
  }
});

export { router as UserRouter };
