import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { runApp } from "./db/index";
import userRouter from "./routes/user";
import taskRouter from "./routes/task";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use("/user", userRouter);
app.use("/task", taskRouter);

dotenv.config({ path: ".env" });
const port = process.env.PORT || 4001;
const uri = process.env.MONGO_URI ?? "mongodb://localhost:27017/usertodo";

runApp(() => {
  app.listen(port, async () => {
    console.log(`Server is running at port : ${port}`);
  });
});
