const { BadRequestError, UnauthorizedError } = require("../errors/");
const { StatusCodes } = require("http-status-codes");
const db = require("../db/index");
const jwt = require("jsonwebtoken");

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

const validatePhoneNumber = (phone) => {
  const regex = /^993(61|62|63|64|65|71)\d{6}$/;
  return regex.test(phone);
};
const fifteenDaysInMs = 15 * 24 * 60 * 60 * 1000;

const register = async (req, res) => {
  const { first_name, last_name, phone } = req.body;

  if (!first_name || !last_name || !phone) {
    throw new BadRequestError(`first_name, last_name or phone is empty`);
  }

  if (
    first_name.length < 3 ||
    first_name.length > 50 ||
    last_name.length < 3 ||
    last_name.length > 50 ||
    !validatePhoneNumber(phone)
  ) {
    throw new BadRequestError(
      `first_name, last_name or phone is not passed validation`
    );
  }

  const response = await db(
    "INSERT INTO users(first_name, last_name, phone_number) VALUES($1, $2, $3) RETURNING *",
    [first_name, last_name, phone]
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
  const { phone } = req.body;

  if (!phone) {
    throw new BadRequestError("Phone must be provided");
  }

  if (!validatePhoneNumber(phone)) {
    throw new BadRequestError("Phone is not passed validation");
  }

  const result = await db("SELECT * FROM users WHERE phone_number = $1", [
    phone,
  ]);
  const user = result.rows[0];

  if (!user) {
    throw new UnauthorizedError("User is not registered yet");
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
