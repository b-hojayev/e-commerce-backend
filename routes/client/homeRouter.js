const express = require("express");
const router = express.Router();
const {
  getMainCategories,
} = require("../../controllers/client/homeController");

router.get("/categories", getMainCategories);

module.exports = router;
