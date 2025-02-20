const { BadRequestError, UnauthorizedError } = require("../../errors/index");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

const fifteenDaysInMs = 15 * 24 * 60 * 60 * 1000;

const login = (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    throw new BadRequestError("name or password is empty");
  }

  if (
    name !== process.env.ADMIN_NAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const token = jwt.sign({ name }, process.env.ADMIN_JWT_SECRET, {
    expiresIn: fifteenDaysInMs,
  });

  res.status(StatusCodes.OK).json({ token });
};

module.exports = { login };
