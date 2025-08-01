import User from "../models/User.js";

export const startTrial = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.trialExpiry) return res.status(400).json({ message: "Trial already started" });

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    user.trialExpiry = expiryDate;
    await user.save();

    res.json({ message: "Trial started", trialExpiry: expiryDate });
  } catch (err) {
    res.status(500).json({ message: "Failed to start trial" });
  }
};

export const checkPlanStatus = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const trialActive = user.trialExpiry && new Date(user.trialExpiry) > new Date();

    res.json({
      plan: user.plan,
      trialExpiry: user.trialExpiry,
      trialActive,   // ✅ Now frontend will get this
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to check plan status" });
  }
};

