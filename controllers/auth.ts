import { Request, Response } from "express";
import User from "../models/User";
import { RegisterType } from "../types/types";
import FriendRequest from "../models/FriendRequest";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

export const register = async (req: Request, res: Response): Promise<any> => {
  const {
    name,
    email,
    password,
    phone,
    photo,
    secretAnswer,
    secretQue,
  }: RegisterType = req.body;

  if (!name) return res.status(400).json({ message: "Name is required" });
  if (!secretAnswer)
    return res.status(400).json({ message: "Secret Answer is required" });
  if (!secretQue)
    return res.status(400).json({ message: "Secret Question is required" });
  if (!password)
    return res.status(400).json({ message: "Password is required" });

  const user = await User.findOne({ email });
  if (user) return res.status(400).send("This email already exist");

  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(password, salt);

  try {
    const newUser = await User.create({
      name,
      email,
      password: hashedPass,
      phone,
      photo,
      secretAnswer,
      secretQue,
    });
    return res.status(201).json(newUser);
  } catch (err) {
    console.log("REGISTER FAILD ==>", err);
    return res.status(500).send("Error, Try Again");
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  const { email, password }: { email: string; password: string } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "This email not found" });

  const correctPass = await bcrypt.compare(password, user.password);

  if (!correctPass)
    return res.status(400).json({ message: "This password not match" });

  user.password = undefined;

  try {
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SEC, {
      expiresIn: "5d",
    });
    return res.json({ user, token }).status(200);
  } catch (err) {
    console.log("REGISTER FAILD ==>", err);
    return res.status(500).send("Error, Try Again");
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<any> => {
  const {
    email,
    newPassword,
    secretAnswer,
    secretQue,
  }: {
    email: string;
    newPassword: string;
    secretAnswer: string;
    secretQue: string;
  } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ message: "This email not found" });

  if (secretQue !== user.secretQue || secretAnswer !== user.secretAnswer)
    return res.status(400).json({
      message:
        "Secret Wrong !! , Please check the secret question and its answer ",
    });

  if (!newPassword)
    return res.status(400).json({ message: "The password is required" });

  const salt = await bcrypt.genSalt(10);

  const hashedPass = await bcrypt.hash(newPassword, salt);

  try {
    await User.findOneAndUpdate(user._id, { password: hashedPass });

    return res.status(200).json({
      message: "Your password has been reset successfully, you can now login",
    });
  } catch (err) {
    console.log("RESET PASSWORD FAILD ==>", err);
    return res.status(500).send("Error, Try Again");
  }
};

export const friendRequest = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { requestTo } = req.body;
  const { userId } = req.body.user;

  try {
    const requestExist = await FriendRequest.findOne({
      requestFrom: userId,
      requestTo,
    });

    const accountExist = await FriendRequest.findOne({
      requestFrom: requestTo,
      requestTo: userId,
    });

    if (requestExist || accountExist) {
      res.status(400).json({ message: "Friend request already sent" });
    } else {
      const newRequest = await FriendRequest.create({
        requestFrom: userId,
        requestTo,
      });
      const user = await User.findById(userId);
      user.requestsFriend.push(requestTo);
      user.save();
      return res.status(201).json(newRequest);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "authEorr" });
  }
};

export const getFriendRequest = async (req: Request, res: Response) => {
  const { userId } = req.body.user;

  try {
    const getRequset = await FriendRequest.find({
      requestTo: userId,
      requestStatus: "Pending",
    }).populate({
      path: "requestFrom",
      select: "name profession photo ",
    });

    return res.status(200).json(getRequset);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "authEorr" });
  }
};
export const getUserInfo = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const info = await User.findById(userId).populate({
      path: "friends",
      select:
        "name profession photo location  email about views isOnline phone friends",
    });

    return res.status(200).json(info);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "authEorr" });
  }
};

export const acceptRequest = async (req: Request, res: Response) => {
  const { userId } = req.body.user;
  const { requestId, status } = req.body;

  try {
    const requestExist = await FriendRequest.findById(requestId);
    !requestExist && res.json({ message: "No frient request found" });

    const newReq = await FriendRequest.findByIdAndUpdate(
      { _id: requestId },
      {
        requestStatus: status,
      }
    );

    if (status === "Accepted") {
      const user = await User.findById(userId);

      user?.friends?.push(requestExist?.requestFrom);
      await user.save();

      const friend = await User.findById(requestExist?.requestFrom);

      friend?.friends?.push(requestExist?.requestTo);
      await friend.save();
    }
    res.status(200).json({ message: "Friend request " + `${status}` });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "authEorr" });
  }
};
export const profileView = async (req: Request, res: Response) => {
  const { userId } = req.body.user;
  const { id } = req.body;

  try {
    const user = await User.findById(id);
    user.views.push(userId);
    await user.save();

    res.status(200).json({ message: "Successfully" });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Error" });
  }
};
export const suggestedFriends = async (req: Request, res: Response) => {
  const { userId } = req.body.user;

  try {
    let queryObject: any = {};
    queryObject._id = { $ne: userId };
    queryObject.friends = { $nin: userId };

    let queryResault = await User.find(queryObject)
      .limit(15)
      .select("name photo profession ");

    const suggestedFriends = await queryResault;

    res.status(200).json({ message: "Successfully", data: suggestedFriends });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Error" });
  }
};
