import express from "express";
import bcrypt from "bcrypt";
const router = express.Router();
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import axios from "axios";
import dotenv from "dotenv";
import { randomBytes } from "crypto";
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

export const verifyUser = async (req, res, next) => {
  console.log("entered verification");
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    console.log("the token man is", token);
    if (!token) {
      return res.json({ status: false, message: "not authenticated" });
    }
    console.log("hemendra", token);
    const decoded = await jwt.verify(token, process.env.SECRET_KEY);
    console.log("hemendra", decoded);
    const user = await User.findById(decoded.userId);
    console.log("deadpool", user);
    if (!user) {
      return res.json({ status: false, message: "invalid authentication" });
    }
    req.user = { email: user.email, userId: user._id };
    next();
  } catch (err) {
    console.log("ironman error", err);
    return res.json({ status: false, message: "invalid token" });
  }
};

router.get("/verify", verifyUser, (req, res) => {
  console.log("entered dauth verifi");
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

// dauth login..........................................................................................................................................................

router.get("/dauth-url", (req, res) => {
  const clientId = "nL5GDqobscCzFD01";
  const redirectUri = encodeURIComponent("http://localhost:5173/login");
  const state = generateRandomString(16);
  const nonce = generateRandomString(16);

  const authUrl = `https://auth.delta.nitt.edu/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&grant_type=authorization_code&state=${state}&scope=email+openid+profile+user&nonce=${nonce}`;

  res.json({ authUrl, state });
});

router.post("/exchange-token", async (req, res) => {
  const { code } = req.body;
  const tokenUrl = "https://auth.delta.nitt.edu/api/oauth/token";
  const clientId = "nL5GDqobscCzFD01";
  const clientSecret = "G7AAEow1KCvg.c.g5N0lDvUq_04Dhb1m";
  const redirectUri = "http://localhost:5173/login";

  try {
    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, id_token } = response.data;
    res.json({ access_token, id_token });
  } catch (error) {
    console.error(
      "Error exchanging code for token:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({
      error: "Failed to exchange code for token",
      details: error.response ? error.response.data : error.message,
      requestUrl: error.config ? error.config.url : "URL not available",
    });
  }
});

router.post("/dauth-login", async (req, res) => {
  const { email, dAuthId } = req.body;
  console.log("hari", email, dAuthId);

  try {
    let user = await User.findOne({ $or: [{ dAuthId }, { email }] });

    if (!user) {
      const randomPassword = randomBytes(20).toString("hex");
      const hashPassword = await bcrypt.hash(randomPassword, 10);

      user = new User({
        email,
        dAuthId,
        password: hashPassword,
        username: email.split("@")[0],
      });

      await user.save();
    } else if (!user.dAuthId) {
      user.dAuthId = dAuthId;
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "8h",
    });
    console.log("sreenesh", token);
    
 res.cookie("token", token, {
   httpOnly: true,
   maxAge: 28800000,
   path: "/",
   domain: "localhost", 
 });
    console.log("Cookie set:", res.getHeaders()["set-cookie"]);

    return res.json({
      status: true,
      message: "Login successful",
      email: user.email,
      token: token,
    });
  } catch (error) {
    console.error("DAuth login error:", error);
    return res.status(500).json({ status: false, message: "Login failed" });
  }
});

router.get("/user-details", async (req, res) => {
  const accessToken = req.headers.authorization.split(" ")[1];

  try {
    const response = await axios.post(
      "https://auth.delta.nitt.edu/api/resources/user",
      null,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const { email, id: dAuthId } = response.data;

    const dAuthLoginResponse = await axios.post(
      "http://localhost:3000/auth/dauth-login",
      {
        email,
        dAuthId,
      }
    );

    if (dAuthLoginResponse.data.status) {
      res.json({
        status: true,
        message: "Login successful",
        email: dAuthLoginResponse.data.email,
        dauthtoken: dAuthLoginResponse.data.token,
      });
    } else {
      res.status(400).json({ status: false, message: "Login failed" });
    }
  } catch (error) {
    console.error("Error in user details or DAuth login:", error);
    res.status(500).json({ status: false, message: "An error occurred" });
  }
});
function generateRandomString(length) {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let text = "";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export { router as UserRouter };
