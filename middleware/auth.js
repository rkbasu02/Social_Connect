const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  const token = req.header("app-token");

  if (!token) {
    return res.status(401).json({ msg: "Unauthorized access" });
  }

  try {
    const decodedVal = jwt.verify(token, config.get("jwtSecret"));
    req.user = decodedVal.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};
