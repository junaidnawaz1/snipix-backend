import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: String,
  clicks: {  
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  qrCode: {
    type: String,  
  },
});

const Url = mongoose.model("Url", urlSchema);
export default Url;
