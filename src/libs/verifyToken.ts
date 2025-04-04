import { Request, Response, NextFunction } from "express";

declare module "express" {
  export interface Request {
    userId?: string;
  }
}
import jwt from "jsonwebtoken";

export interface IPayload {
  _id: string;
  iat: number;
}

export const TokenValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("auth-token");
    console.log(token);
    if (!token) return res.status(401).json("Access Denied");
    console.log(process.env["TOKEN_SECRET"]);
    const payload = jwt.verify(
      token,
      process.env["TOKEN_SECRET"] || ""
    ) as IPayload;
    req.userId = payload._id;
    next();
  } catch (e) {
    console.log(e);
    res.status(400).send("Invalid Token");
  }
};
