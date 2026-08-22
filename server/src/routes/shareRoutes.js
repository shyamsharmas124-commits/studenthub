const router = require("express").Router();
const { renderCoursePage } = require("../controllers/shareController");

router.get("/course/:id", renderCoursePage);

module.exports = router;
