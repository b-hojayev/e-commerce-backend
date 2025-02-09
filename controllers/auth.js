const { BadRequestError, UnauthorizedError } = require("../errors/");
const db = require("../db/index");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

function validatePhoneNumber(phone) {
  const regex = /^993(61|62|63|64|65|71)\d{6}$/;
  return regex.test(phone);
}
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

  const accessToken = jwt.sign(
    { id: user.id },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    {
      expiresIn: "1h",
    }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_TOKEN_SECRET,
    { expiresIn: "15d" }
  );

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    maxAge: fifteenDaysInMs,
  });

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

  const accessToken = jwt.sign(
    { id: user.id },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    {
      expiresIn: "1h",
    }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_TOKEN_SECRET,
    { expiresIn: "15d" }
  );

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    maxAge: fifteenDaysInMs,
  });

  return res.status(StatusCodes.OK).json({ accessToken });
};

module.exports = { register, login };
