const express = require("express");
const router = express.Router();
const {
  createType,
  deleteType,
  getAllTypes,
  getSingleType,
  updateType,
} = require("../../controllers/admin/adminTypeController");

router.get("/", getAllTypes);
router.get("/:typeId", getSingleType);
router.post("/", createType);
router.put("/:typeId", updateType);
router.delete("/:typeId", deleteType);

module.exports = router;
