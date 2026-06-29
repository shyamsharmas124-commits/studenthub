const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { getProfile, setRole, updateProfile } = require("../controllers/userController");

router.get("/profile", auth, getProfile);
router.patch("/role", auth, setRole);
router.patch("/profile", auth, updateProfile);

module.exports = router;




