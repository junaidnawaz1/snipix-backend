import User from "../models/User.js";

const checkPlan = (requiredPlan = "free") => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const now = new Date();

      // If requiredPlan is paid, check user's plan or trial
      if (requiredPlan === "paid") {
        if (
          user.plan === "paid" ||
          (user.trialExpiry && new Date(user.trialExpiry) > now)
        ) {
          return next();
        } else {
          return res.status(403).json({ message: "Upgrade to access this feature" });
        }
      }

      // If requiredPlan is free, allow
      next();

    } catch (err) {
      res.status(500).json({ message: "Plan check failed" });
    }
  };
};

export default checkPlan;
