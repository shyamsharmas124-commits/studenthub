const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  getProfile,
  setRole,
  updateProfile,
  updateEmail,
  changePassword,
} = require("../controllers/userController");

router.get("/profile", auth, getProfile);
router.patch("/role", auth, setRole);
router.patch("/profile", auth, updateProfile);
router.patch("/email", auth, updateEmail);
router.patch("/password", auth, changePassword);

module.exports = router;




