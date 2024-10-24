import User from "../models/userModel";
import Task, { getTaskStatusDescription } from "../models/taskModel";
import { ITask } from "../models/taskModel";
import { IUser } from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response } from "express";
dotenv.config({ path: ".env" });

const jwtSecret = process.env.JWT_SECRET || "";

///???????

interface CustomRequest extends Request {
  user?: IUser;
}

export const registerController = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ message: "Username and email and password are required" });
  }
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: `User ${email}  already exists` });
    }

    const hashRounds = 10;
    const hashedPassword = await bcrypt.hash(password, hashRounds);

    // const user = new User({
    //   username,
    //   email,
    //   password: hashedPassword,
    // });
    //await newUser.save();

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    res.status(201).json({ message: "User created", user });
  } catch (error: any) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: `Duplicate username: ${username}` });
    } else {
      res.status(500).json(error);
    }
  }
};

export const loginController = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    const foundUser = await User.findOne({ username });

    if (!foundUser) {
      return res.status(400).send("User not found");
    }

    if (foundUser) {
      const isPasswordValid = await bcrypt.compare(
        password,
        foundUser.password
      );

      if (!isPasswordValid) {
        return res.status(400).send("Invalid password");
      }
      console.log("User ID before generating token:", foundUser._id.toString());

      const token = jwt.sign({ id: foundUser._id.toString() }, jwtSecret, {
        expiresIn: "1h",
      });

      res.status(200).json({ token, user: await User.findById(foundUser._id) });
    }
  } catch (error: any) {
    res.status(500).send(error.message);
  }
};

// export const logoutController = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?.id;
//     await User.findByIdAndUpdate(userId, { $set: { online: false } });
//     // localStorage.removeItem("token");
//     res.status(200).json("User logged out");
//   } catch (error: any) {
//     res.status(500).send(error.message);
//   }
// };

export const createTask = async (
  req: CustomRequest,
  res: Response
): Promise<any> => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized in auth" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newTask = await Task.create({
      title,
      description,
      // user: userId,
      // createAt: Date.now(),
    });
    await User.findByIdAndUpdate(userId, {
      $push: {
        tasks: newTask._id,
      },
    });
    return res
      .status(201)
      .json({ message: "Task is created successfully", newTask });
  } catch (error: any) {
    res.status(500).json({ message: "Error while creating task" });
  }
};

export const updateTask = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }
    if (!id) {
      return res.status(400).json({ message: "Id is required" });
    }
    const updatedTask = await Task.findByIdAndUpdate(id, {
      title,
      description,
    });
    return res
      .status(200)
      .json({ message: "Task is updated successfully", updatedTask });
  } catch (error: any) {
    res.status(500).json({ message: "Error while updating task" });
  }
};

export const updateStatusTask = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    const updatedTask = await Task.findByIdAndUpdate(id, {
      $set: { status: status },
    });
    if (!updatedTask) {
      res.status(404).json({ message: "Failed to update status" });
    } else {
      const statusDescription = getTaskStatusDescription(status);
      return res.status(200).json({
        message: "Task is updated successfully",
        updatedTask,
        statusDescription,
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: "Error while updating task" });
  }
};

export const deleteTask = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Id is required" });
    }
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized in auth" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    await User.findByIdAndUpdate(userId, {
      $pull: {
        tasks: deletedTask._id,
      },
    });
    return res
      .status(200)
      .json({ message: "Task is deleted successfully", deletedTask });
  } catch (error: any) {
    res.status(500).json({ message: "Error while deleting task" });
  }
};

export const getAllTasks = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized in auth" });
    }

    const user = await User.findById(userId).populate("tasks");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // const tasks = await Task.find({ user: userId }).populate("user");
    if (user.tasks.length === 0) {
      return res
        .status(200)
        .json({ message: "No tasks found for you", tasks: user.tasks });
    }
    return res.status(200).json({ message: "All tasks", tasks: user.tasks });
  } catch (error: any) {
    res.status(500).json({ message: "Error while getting tasks" });
  }
};

export const getFilteredTasks = async (req: CustomRequest, res: Response) => {
  try {
    const { status } = req.body as {
      status?: string;
    };

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized in auth" });
    }
    const user = await User.findById(userId).populate("tasks");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let tasks = user.tasks;

    if (status !== undefined) {
      // criteria.status = status === "true" ? true : false;
      tasks = tasks.filter((task: any) => task.status === status);
    }
    return res
      .status(200)
      .json({ message: "Tasks fetched successfully", tasks });
  } catch (error: any) {
    console.error("Error while fetching tasks:", error.message);
    res.status(500).json({ message: "Error while fetching tasks" });
  }
};

export const getFilteredDateTasks = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const { createdAt } = req.body as {
      createdAt?: Date;
    };

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized in auth" });
    }
    const user = await User.findById(userId).populate("tasks");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let tasks = user.tasks;

    if (createdAt) {
      const createdAtIso = new Date(createdAt).toISOString();
      tasks = tasks.filter(
        (task: any) => new Date(task.createdAt).toISOString() === createdAtIso
      );
    }
    return res
      .status(200)
      .json({ message: "Tasks fetched successfully", tasks });
  } catch (error: any) {
    console.error("Error while fetching tasks:", error.message);
    res.status(500).json({ message: "Error while fetching tasks" });
  }
};

export const getTasksById = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({ message: `Task with ${id} not found` });
      return;
    } else {
      const statusDescription = getTaskStatusDescription(task.status);
      return res.status(200).json({
        message: "Task fetched successfully",
        task,
        statusDescription,
      });
    }
  } catch (error: any) {
    console.error("Error while fetching task:", error.message);
    res.status(500).json({ message: "Error while fetching task" });
  }
};
