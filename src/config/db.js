import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("DB Connecetd");
  } catch (error) {
    console.log("Connection faile : ", error.message);
  }
}

export default connectDB;
