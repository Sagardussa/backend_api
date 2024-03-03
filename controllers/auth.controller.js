import Role from "../models/Role.js";
import User from "../models/User.js";
import UserToken from "../models/UserToken.js";
import bcrypt from "bcryptjs";
import { createSuccess } from "../utils/success.js";
import { createError } from "../utils/error.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export const register = async (req, res, next) => {
  try {
    const role = await Role.find({ role: "User" });
    const salt = await bcrypt.genSalt(10);
    const hasPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userName: req.body.userName,
      password: hasPassword,
      email: req.body.email,
      roles: role,
      // profileIamge: req.body.profileIamge,
      // isAdmin: req.body.isAdmin,
    });

    await newUser.save();
    return next(createSuccess(200, "User Registered Successfully"));
  } catch (error) {
    return next(
      createError(
        500,
        "Something went wrong email or userName is already exist!"
      )
    );
  }
};

export const registerAdmin = async (req, res, next) => {
  const role = await Role.find();
  const salt = await bcrypt.genSalt(10);
  const hasPassword = await bcrypt.hash(req.body.password, salt);

  const newUser = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    userName: req.body.userName,
    password: hasPassword,
    email: req.body.email,
    roles: role,
    isAdmin: true,
    // profileIamge: req.body.profileIamge,
    // isAdmin: req.body.isAdmin,
  });

  await newUser.save();
  //   return res.send("User Registered Successfully");
  return next(createSuccess(200, "Admin Registered Successfully"));
};

export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email }).populate(
      "roles",
      "role"
    );
    const { roles } = user;
    if (!user) {
      //   return res.status(404).send("User not found");
      return next(createError(400, "User not found"));
    }
    let ispasswordcorrct = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!ispasswordcorrct) {
      //   return res.status(400).send("Password is incorrect");
      return next(createError(400, "Password is incorrect"));
    }

    const token = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
        roles: roles,
      },
      process.env.JWT_SECRET
    );

    res.cookie("access_token", token, { httpOnly: true }).status(200).json({
      status: 200,
      message: "login Successfully",
      data: user,
    });

    // res.status(200).send("login Successfully");
    return next(createSuccess(200, "login Successfully"));
  } catch (error) {
    // return res.status(500).send("Something went!");
    return next(createError(500, "Something went wrong!"));
  }
};

export const sendEmail = async (req, res, next) => {
  const email = req.body.email;

  const user = await User.findOne({
    email: { $regex: "^" + email + "$", $options: "i" },
  });
  if (!user) {
    return next(createError(404, "User not found to reset the email!"));
  }
  const payload = {
    email: user.email,
  };
  const expiryTime = 300;

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: expiryTime,
  });

  const newToken = new UserToken({
    userId: user._id,
    token: token,
  });

  const mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "sagardussa8004@gmail.com",
      pass: "liuz xfsf vift yspw",
    },
  });

  let mailDetails = {
    from: "sagardussa8004@gmail.com",
    to: email,
    subject: "Reset Password",
    // text: 'Hi from your nodemailer project'
    html: `
    <html>
    <head>
      <title>Password Reset Request</title>
    </head>
    <body>
      <h1>Password Reset Request</h1>
      <p>Dear ${user.userName},</p>
      <p>We have received a request to reset your password for your account with BookMYBook. To complete the password reset process, please click on the button below:</p> 
      <a href= ${process.env.LIVE_URL}/reset/${token}><button style="background-color: #4CAF50; color: white; padding: 14px 20px; border: none; cursor: pointer; border-radius: 4px;">Reset Password</button></a>
      <p>Please note that this link is only valid for 5mins. If you did not request a password reset, please disregard this message.</p>
      <p>Thank you,</p>
      <p>Let's Program Team</p>
    </body>
    </html>`,
  };

  mailTransporter.sendMail(mailDetails, async (err, data) => {
    if (err) {
      console.log("err", err);
      return next(createError(500, "Something went wrong while sending mail!"));
    } else {
      await newToken.save();
      return next(createSuccess(200, "Email sent successfully"));
    }
  });
};

export const resetPassword = async (req, res, next) => {
  const token = req.body.token;
  const newPassword = req.body.password;

  jwt.verify(token, process.env.JWT_SECRET, async (err, data) => {
    if (err) {
      return next(createError(500, "Reset Link is Expired!"));
    } else {
      const respone = data;
      const user = await User.findOne({
        email: { $regex: "^" + respone.email + "$", $options: "i" },
      });

      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(newPassword, salt);

      user.password = encryptedPassword;
      try {
        const userupdate = await User.findOneAndUpdate(
          { _id: user._id },
          { $set: user },
          { new: true }
        );
        return next(createSuccess(200, "Password Reset success!"));
      } catch (error) {
        return next(
          createError(500, "Something went wrong while resetting password!")
        );
      }
    }
  });
};
