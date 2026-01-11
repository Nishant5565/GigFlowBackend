const express = require("express");
const router = express.Router();
const {
  createGig,
  getAllGigs,
  getGigById,
  getMyGigs,
  updateGigStatus,
} = require("../controllers/gig.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/", protect, createGig);
router.get("/", getAllGigs);
router.get("/my", protect, getMyGigs);
router.get("/:id", getGigById);
router.put("/:id/status", protect, updateGigStatus);

module.exports = router;
