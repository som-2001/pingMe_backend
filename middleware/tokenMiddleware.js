const jwt = require("jsonwebtoken");
require("dotenv").config();

const tokenMiddleware = (req, res, next) => {
  if (req.cookies.refreshToken) {
    try {
      const verifiedRefreshToken = jwt.verify(
        req.cookies.refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      req.user = verifiedRefreshToken;
      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        console.log("Refersh token expired");

        return res.status(401).json({ message: "Not Authorized" });
      }
      console.log("Invalid token");
      return res.status(401).json({ message: "Invalid token. Not Authorized" });
    }
  } else {
    return res.status(404).json({ message: "Token not found." });
  }
};
module.exports = tokenMiddleware;
