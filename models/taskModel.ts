import mongoose, { Document } from "mongoose";
// import { IUser } from "./userModel";

export type TaskStatus = "pending" | "in_process" | "completed";

const taskStatusData: Record<TaskStatus, string> = {
  pending: "Task is awaiting action",
  in_process: "Task is in work now",
  completed: "Task is done",
};
export const getTaskStatusDescription = (status: TaskStatus): string => {
  return taskStatusData[status];
};

export interface ITask extends Document {
  title: string;
  description: string;
  status: TaskStatus;
  // completed: Boolean;
  createdAt: Date;
  // user: IUser;
}

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "in_process", "completed"],
  },
  // completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  // user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const Task = mongoose.model("Task", taskSchema);

export default Task;
