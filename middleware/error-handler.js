const { StatusCodes } = require("http-status-codes");

const errorHandlerMiddleware = (err, req, res, next) => {
  console.log(err);

  let customError = {
    message: err.message || "Something went wrong",
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
  };

  if (err.code === "23505") {
    return res.status(StatusCodes.BAD_REQUEST).json(err.detail);
  }

  res.status(customError.statusCode).json(customError.message);
};

module.exports = errorHandlerMiddleware;
