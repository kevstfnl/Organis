const router = require("express").Router();

router.get("/", (req, res) => req.user ? res.redirect("/dashboard") : res.render("pages/home.html.twig"));
router.get("/test", (req, res) => res.render("pages/mail/unverified.html.twig"))

module.exports = router;