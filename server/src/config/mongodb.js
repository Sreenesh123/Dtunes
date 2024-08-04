import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.connection.on("connected", () => {
    console.log("Connection established");
  });

  mongoose.connection.on("disconnected", () => {
    console.log("Connection lost. Trying to reconnect...");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("Connection reestablished");
  });

  mongoose.connection.on("error", (err) => {
    console.log("Connection error:", err);
  });

  try {  
    await mongoose.connect(process.env.DB)
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); 
  }
};

export default connectDB;
