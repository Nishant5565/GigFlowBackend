const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  checkAuth,
} = require("../controllers/auth.controller");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/check", checkAuth);

module.exports = router;
