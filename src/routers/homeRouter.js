const { verify } = require("../middlewares/authguard");
const { sendTestMail } = require("../utils/mail");

const router = require("express").Router();

router.get("/", (req, res) => {
    if (req.user) return res.redirect("/dashboard");
    res.render("pages/home.html.twig");
});
router.get("/login", (req, res) => {
    res.render("pages/login.html.twig");
});
router.get("/register", (req, res) => {
    res.render("pages/register.html.twig");
});
router.get("/logout", (req, res) => {
    req.session.destroy();
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
    });
    res.redirect("/");
});
router.get("/dashboard", verify, (req, res) => {
    res.render("pages/dashboard.html.twig", { user: req.user });
});

module.exports = router;