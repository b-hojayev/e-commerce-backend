const db = require("../../db/index");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../../errors");

const getAllTypes = async (req, res) => {
  const response = await db("SELECT * FROM type");
  const types = response.rows;

  res.status(StatusCodes.OK).json(types);
};

const getSingleType = async (req, res) => {
  const { typeId } = req.params;

  const response = await db("SELECT * FROM type WHERE id = $1", [typeId]);
  const type = response.rows[0];

  if (!type) {
    throw new NotFoundError("type does not exist");
  }

  res.status(StatusCodes.OK).json(type);
};

const createType = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new BadRequestError("name must be provided");
  }

  await db("INSERT INTO type (name) VALUES ($1)", [name]);

  res.status(StatusCodes.OK).send();
};

const updateType = async (req, res) => {
  const { typeId } = req.params;
  const { name } = req.body;

  if (!name) {
    throw new BadRequestError("name must be provided");
  }

  const response = await db("UPDATE type SET name = $1 WHERE id = $2", [
    name,
    typeId,
  ]);

  if (!response.rowCount) {
    return res.status(StatusCodes.NOT_FOUND).json(`no type with id ${typeId}`);
  }

  res.status(StatusCodes.OK).json(response);
};

const deleteType = async (req, res) => {
  const { typeId } = req.params;

  const response = await db("DELETE FROM type WHERE id = $1", [typeId]);

  if (!response.rowCount) {
    return res.status(StatusCodes.NOT_FOUND).json(`No type with id ${typeId}`);
  }

  res.status(StatusCodes.OK).send();
};

module.exports = {
  getAllTypes,
  getSingleType,
  createType,
  updateType,
  deleteType,
};
