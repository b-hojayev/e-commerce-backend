const { UnauthorizedError } = require("../errors/index");
const jwt = require("jsonwebtoken");

const adminAuthenticationMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Authentication invalid");
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    const { name } = payload;
    req.user = { name };
    next();
  } catch (error) {
    throw new UnauthorizedError("Authentication invalid");
  }
};

module.exports = adminAuthenticationMiddleware;
