const { UnauthorizedError } = require("../errors/index");
const jwt = require("jsonwebtoken");

const authenticationMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Authentication invalid");
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
    const { userId } = payload;
    req.user = { userId };
    next();
  } catch (error) {
    throw new UnauthorizedError("Authentication invalid");
  }
};

module.exports = authenticationMiddleware;
