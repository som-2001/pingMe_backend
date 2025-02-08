const express = require("express");
const jwt = require("jsonwebtoken");
const { encryption, is_match } = require("node-data-cryption");
const User = require("../../model/UserSchema.js");
require("dotenv").config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;


const Login=async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    // Validate password
    console.log(user);

    const isValid = is_match(password, user.salt[1], user.salt[0]);
    if (!isValid)
      return res.status(401).json({ message: "Invalid email or password" });

    // Generate JWT tokens
    const accessToken = jwt.sign({ userId: user._id }, ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign({ userId: user._id }, REFRESH_TOKEN_SECRET, {
      expiresIn: "20d",
    });

    // Store tokens in cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: false,
      secure: false,
      maxAge: 3600000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: false,
      secure: false,
      maxAge: 1728000000,
    });

    res.json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {Login};
