const express = require("express");
const router = express.Router();
const {
  createBid,
  getGigBids,
  hireFreelancer,
  getMyBids, // [NEW]
} = require("../controllers/bid.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/", protect, createBid);
router.get("/my-bids", protect, getMyBids); // [NEW] Must be before :gigId to avoid conflict if :gigId matches "my-bids" (though IDs usually don't)
router.get("/:gigId", protect, getGigBids);
router.post("/:bidId/hire", protect, hireFreelancer);

module.exports = router;
