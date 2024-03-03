import User from "../models/User.js";
import { createError } from "../utils/error.js";
import { createSuccess } from "../utils/success.js";

export const getAllUser = async (req, res, next) => {
  try {
    const users = await User.find();
    return next(createSuccess(200, "All user", users));
  } catch (error) {
    return next(createError(500, "Internal serve error!"));
  }
};

export const getById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(createError(404, "user not found"));
    }
    return next(createSuccess(200, "single user", user));
  } catch (error) {
    return next(createError(500, "Internal serve error!"));
  }
};
