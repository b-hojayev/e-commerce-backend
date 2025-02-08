const BadRequestError = require("../errors/bad-request");

function validatePhoneNumber(phone) {
  const regex = /^993(61|62|63|64|65|71)\d{6}$/;
  return regex.test(phone);
}

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

  res.json(req.body);
};

const login = async (req, res) => {
  res.status(200).send("login");
};

module.exports = { register, login };
