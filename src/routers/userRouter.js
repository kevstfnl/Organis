const { verify } = require("../middlewares/authguard");
const { clearSignedCookieAndSession } = require("../utils/cookie");
const { validateMail } = require("../controllers/userController");
const router = require("express").Router();

router.get("/login", (req, res) => res.render("pages/login.html.twig"));
router.get("/register", (req, res) => res.render("pages/register.html.twig"));
router.get("/logout", (req, res) => clearSignedCookieAndSession(req, res, "refreshToken"));
router.get("/validate/:token", validateMail);
router.get("/dashboard", verify, (req, res) => req.user.verified ? res.render("pages/dashboard.html.twig", { user: req.user }) : res.render("pages/unverified.html.twig", { user: req.user }));


module.exports = router;