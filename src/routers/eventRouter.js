const { Role } = require("@prisma/client");
const { authguard } = require("../middlewares/authguard");
const { getEvents, addEvent } = require("../controllers/eventController");

const router = require("express").Router();

router.get("/add/event/:userId", authguard, (req, res) => {
    res.render("pages/dashboard/addevent.html.twig", { user: req.user, userId: req.params.userId });
});
router.post("/add/event/:userId", authguard, addEvent);

router.get("/events", authguard, getEvents);

module.exports = router;