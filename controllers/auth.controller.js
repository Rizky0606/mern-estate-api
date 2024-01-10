import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcryptjs.hashSync(password, 10);

  const newUser = new User({ username, email, password: hashedPassword });
  const validUsername = await User.findOne({ username });
  const validEmail = await User.findOne({ email });
  // console.log(validEmail);
  if (validUsername) return next(errorHandler(404, "Username Already Exists"));
  if (validEmail) return next(errorHandler(404, "Email Already Exists"));

  try {
    await newUser.save();
    return res.status(201).json({
      code: 201,
      status: "success",
      message: "User created successfully",
    });
  } catch (error) {
    next(errorHandler(500, "Something Went Wrong"));
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, "Email Not Found"));

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, "Invalid Password"));

    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);

    const { password: pass, ...rest } = validUser._doc;

    res.cookie("access_token", token, { httpOnly: true }).status(200).json({
      code: 200,
      status: "success",
      message: "Login Successful",
      data: rest,
    });
  } catch (error) {
    next(errorHandler(500, "Login Failed"));
  }
};
