const router = require("express").Router();

router.get("/", (req, res) => {
    res.render("pages/home.html.twig");
});
router.get("/login", (req, res) => {
    res.render("pages/login.html.twig");
});
router.get("/register", (req, res) => {
    res.render("pages/register.html.twig");
});
module.exports = router;