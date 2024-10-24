import jwt from "jsonwebtoken";
import User from "../models/userModel";
import dotenv from "dotenv";
dotenv.config();
import { Request, Response, NextFunction, RequestHandler } from "express";

const jwtSecret = process.env.JWT_SECRET as string;

interface JwtPayload {
  id: string;
  username: string;
}

interface CustomRequest extends Request {
  user?: JwtPayload;
}

const authenticateJWT: RequestHandler = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): any => {
  const { authorization } = req.headers;
  try {
    if (authorization && authorization.startsWith("Bearer ")) {
      // const token = authorization.slice(7);
      const token = authorization.split(" ")[1];

      console.log("Authorization header:", authorization);
      console.log("Extracted token:", token);

      jwt.verify(token, jwtSecret, (err, decodedToken) => {
        if (err) {
          return res.status(403).json({ message: "Invalid or expired token" });
        }
        console.log("Decoded token:", decodedToken);
        if (
          !decodedToken ||
          typeof decodedToken !== "object" ||
          !("id" in decodedToken)
        ) {
          return res
            .status(401)
            .json({ message: "Token does not contain user id" });
        }
        req.user = decodedToken as JwtPayload;
        console.log("User ID in req.user in middleware:", req.user.id);
        next();
      });
    } else {
      return res.status(401).json({ message: "Unauthorized in middleware" });
    }
  } catch (error) {
    return res.status(500).send(error);
  }
};

export default authenticateJWT;
