// adminController.js

import User from "../models/User.js";
import Url from "../models/Url.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};

export const getAllLinks = async (req, res) => {
  try {
    const links = await Url.find().sort({ createdAt: -1 }).populate("userId", "_id username email");
    res.json(links);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch links" });
  }
};

export const deleteLink = async (req, res) => {
  try {
    await Url.findByIdAndDelete(req.params.id);
    res.json({ message: "Link deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete link" });
  }
};
