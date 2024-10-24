import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });
const port = 4001;
const uri = process.env.MONGO_URI ?? "mongodb://localhost:27017/usertodo";

export const runApp = async (callback: () => void) => {
  mongoose
    .connect(uri, {})
    .then(() => {
      console.log("Mongoos Database connected successfully");
      callback();
    })
    .catch((error: Error) => {
      console.log("Mongoose connection failed:", error);
    });
};
