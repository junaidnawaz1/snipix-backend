import User from "../models/User.js";

const checkAlias = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.body.customAlias) {  
      if (user.plan !== "paid" && !user.trialExpiry) {
        return res.status(403).json({ message: "Custom alias is only available for Pro users or Trial users." });
      }
    }

    next();
  } catch (err) {
    res.status(500).json({ message: "Alias check failed" });
  }
};

export default checkAlias;
