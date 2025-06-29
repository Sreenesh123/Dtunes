import axios from 'axios';
axios.defaults.baseURL = "http://localhost:3000"; 
export const verifyUser = async (req, res, next) => {
  try {
    console.log("entered verification");
    const token = req.cookies.dauthtoken || req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const response = await axios.get("/auth/verify", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data.status) {
      console.log("verification success");
      req.user = response.data;
      next();
    } else {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } catch (error) {
    console.error("Verification failed:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
};
