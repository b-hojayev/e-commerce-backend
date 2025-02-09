const BadRequestError = require("../errors/bad-request");
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
    last_name.length < 3 ||
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
    { expiresIn: "10d" }
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
  res.status(200).send("login");
};

module.exports = { register, login };
