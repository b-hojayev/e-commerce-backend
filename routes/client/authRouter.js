const express = require("express");
const router = express.Router();
const {
  login,
  register,
  refresh,
} = require("../../controllers/client/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/refresh", refresh);

module.exports = router;
