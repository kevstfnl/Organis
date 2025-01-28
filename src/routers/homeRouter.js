const router = require("express").Router();

router.get("/", (req, res) => {
    if (req.session.accessToken || req.signedCookies.refreshToken) return res.redirect("/dashboard");
    res.render("pages/home.html.twig")
});

module.exports = router;