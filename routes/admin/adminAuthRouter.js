const express = require("express");
const router = express.Router();
const { login } = require("../../controllers/admin/adminAuthController");

router.post("/", login);

module.exports = router;
