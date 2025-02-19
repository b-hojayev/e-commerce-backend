const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} = require("../errors/");
const { StatusCodes } = require("http-status-codes");
const db = require("../db/index");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const setRefreshToCookie = (response, refreshToken) => {
  return response.cookie("jwt", refreshToken, {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    maxAge: fifteenDaysInMs,
  });
};

const generateToken = (userId, key, expiresIn) => {
  return jwt.sign({ userId }, key, {
    expiresIn,
  });
};

function isValidEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/;
  return regex.test(email);
}

const fifteenDaysInMs = 15 * 24 * 60 * 60 * 1000;

const register = async (req, res) => {
  const { name, password, email } = req.body;

  if (!name || !password || !email) {
    throw new BadRequestError(`name, password or email is empty`);
  }

  if (name.length < 3 || name.length > 50) {
    throw new BadRequestError(`name is not passed validation`);
  }

  if (password.length < 6 || password.length > 50) {
    throw new BadRequestError("password is not passed validation");
  }

  if (!isValidEmail(email)) {
    throw new BadRequestError("email invalid");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const response = await db(
    "INSERT INTO users (name, password, email) VALUES($1, $2, $3) RETURNING *",
    [name, hash, email]
  );
  const user = response.rows[0];

  const accessToken = generateToken(
    user.id,
    process.env.JWT_ACCESS_TOKEN_SECRET,
    "1h"
  );
  const refreshToken = generateToken(
    user.id,
    process.env.JWT_REFRESH_TOKEN_SECRET,
    "15d"
  );

  setRefreshToCookie(res, refreshToken);

  return res.status(StatusCodes.OK).json({ accessToken });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("email and password must be provided");
  }

  if (!isValidEmail(email)) {
    throw new BadRequestError("email invalid");
  }

  if (password.length < 6 || password.length > 50) {
    throw new BadRequestError("password is not passed validation");
  }

  const result = await db("SELECT * FROM users WHERE email = $1", [email]);
  const user = result.rows[0];

  if (!user) {
    throw new NotFoundError("user is not found");
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw new UnauthorizedError("invalid credentials");
  }

  const accessToken = generateToken(
    user.id,
    process.env.JWT_ACCESS_TOKEN_SECRET,
    "1h"
  );
  const refreshToken = generateToken(
    user.id,
    process.env.JWT_REFRESH_TOKEN_SECRET,
    "15d"
  );

  setRefreshToCookie(res, refreshToken);

  return res.status(StatusCodes.OK).json({ accessToken });
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies.jwt;

  if (!refreshToken) {
    throw new UnauthorizedError("Refresh token is missing");
  }

  try {
    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET
    );

    const accessToken = generateToken(
      payload.userId,
      process.env.JWT_ACCESS_TOKEN_SECRET,
      "1h"
    );
    const newRefreshToken = generateToken(
      payload.userId,
      process.env.JWT_REFRESH_TOKEN_SECRET,
      "15d"
    );

    setRefreshToCookie(res, newRefreshToken);

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.log(error);

    throw new UnauthorizedError("Refresh token is invalid");
  }
};

module.exports = { register, login, refresh };
