// File: backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {

  console.log("Received Auth Header:", req.headers.authorization);
  let token;

  // 1. Check for Authorization header and ensure it starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract the token from the 'Bearer <token>' string
      token = req.headers.authorization.split(" ")[1];

      if (token === "null" || token === "undefined" || !token) {
        return res.status(401).json({ message: "Not authorized, token is null or missing" });
      }

      // DEBUG: Log the secret key to ensure environment variables are loaded
      console.log("Using Secret Key:", process.env.JWT_SECRET);

      // 2. Verify the token signature
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Find the user by ID from the decoded token and attach to the request object
      req.user = await User.findById(decoded.id).select("-password");

      // Move to the next middleware or controller function
      next();
    } catch (error) {
      // Log the specific verification error for debugging
      console.error("JWT Verification Error:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    // 4. Handle cases where no token is provided in the header at all
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };