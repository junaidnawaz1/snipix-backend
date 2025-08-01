import Url from "../models/Url.js";
import { nanoid } from "nanoid";
import QRCode from "qrcode";

export const createShortUrl = async (req, res) => {
  try {
    const { originalUrl, customAlias, expiry } = req.body;
    const userId = req.user.id;

    // Validate and normalize original URL
    if (!originalUrl) {
      return res.status(400).json({ message: "Original URL is required" });
    }

    // Ensure URL has protocol
    let normalizedUrl = originalUrl;
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // Create short code
    let shortCode;
    if (customAlias) {
      const existing = await Url.findOne({ shortUrl: customAlias });
      if (existing) {
        return res.status(400).json({ message: "Custom alias already exists" });
      }
      shortCode = customAlias;
    } else {
      shortCode = nanoid(6);
    }

    // Build complete short URL
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.PRODUCTION_URL 
      : 'http://localhost:3000';
    const fullShortUrl = `${baseUrl}/${shortCode}`;

    // Generate QR code
    const qrCode = await QRCode.toDataURL(fullShortUrl);

    // Save to database
    const urlDoc = new Url({
      originalUrl: normalizedUrl,
      shortUrl: shortCode,
      fullShortUrl,
      userId,
      expiresAt: getExpiryDate(expiry),
      qrCode,
    });

    await urlDoc.save();

    res.status(201).json({
      success: true,
      shortUrl: fullShortUrl,
      shortCode,
      originalUrl: normalizedUrl,
      qrCode,
    });

  } catch (err) {
    console.error("Error creating short URL:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Helper function for expiry dates
function getExpiryDate(expiry) {
  if (!expiry) return null;
  const days = parseInt(expiry);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export const redirectShortUrl = async (req, res) => {
  try {
    const { shortUrl } = req.params;
    
    // Debug: Log the incoming short URL
    console.log(`Redirect request for: ${shortUrl}`);
    
    // Atomic update with error handling
    const url = await Url.findOneAndUpdate(
      { shortUrl },
      { $inc: { clicks: 1 } },
      { 
        new: true,
        upsert: false // Ensure we don't create new documents
      }
    ).lean(); // Use lean() for better performance

    if (!url) {
      console.log('URL not found in database');
      return res.status(404).json({ message: "URL not found" });
    }

    // Debug: Log current click count
    console.log(`Current clicks: ${url.clicks + 1}`); // +1 because lean() returns pre-update doc

    // Check expiration
    if (url.expiresAt && new Date() > new Date(url.expiresAt)) {
      console.log('Expired URL accessed');
      return res.status(410).json({ message: "This link has expired" });
    }

    // Prepare redirect URL
    let redirectUrl = url.originalUrl;
    if (!/^https?:\/\//i.test(redirectUrl)) {
      redirectUrl = `https://${redirectUrl}`;
    }

    // Force no caching
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });

    // Debug: Log the redirect
    console.log(`Redirecting to: ${redirectUrl}`);
    
    // Use 302 (temporary) redirect instead of 301 (permanent)
    return res.redirect(302, redirectUrl);

  } catch (error) {
    console.error("Redirect error:", error);
    return res.status(500).json({   
      message: "Server error",
      error: error.message 
    });
  }
};
// ... keep existing analytics and delete functions ...

// 📊 Analytics (User-specific)
export const getAnalytics = async (req, res) => {
  try {
    const links = await Url.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(links.map(link => ({
      _id: link._id,
      shortUrl: link.shortUrl,
      originalUrl: link.originalUrl,
      clicks: link.clicks,
      createdAt: link.createdAt,
      qrCode: link.qrCode,
    })));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};


//  User Delete Own Link
export const deleteUserLink = async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);
    if (!url) return res.status(404).json({ message: "Link not found" });

    if (url.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    await url.deleteOne();
    res.json({ message: "Link deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};