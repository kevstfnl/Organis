const { verify } = require("../middlewares/authguard");
const { clearSignedCookieAndSession } = require("../utils/cookie");
const { login } = require("../controllers/userController");
const { register, sendValidationMail, validateMail, requestChangeValidationMail, handleChangeValidationMail } = require("../controllers/registerController");
const { uncryptIds } = require("../middlewares/idSharing");
const router = require("express").Router();

router.get("/login", (req, res) => res.render("pages/login.html.twig"));
router.post("/login", login);
router.get("/register", (req, res) => res.render("pages/register.html.twig"));
router.post("/register", register);
router.get("/logout", (req, res) => clearSignedCookieAndSession(req, res, "refreshToken"));

router.get("/validate/:token", validateMail);
router.get("/change/:id", uncryptIds, requestChangeValidationMail);
router.post("/change/:id", uncryptIds, handleChangeValidationMail);
router.get("/mail/:id", uncryptIds, sendValidationMail);

router.get("/dashboard", verify, (req, res) => req.user.verified ? 
      res.render("pages/dashboard.html.twig", { user: req.user }) :
      res.render("pages/unverified.html.twig", { user: req.user.id })
);

module.exports = router;