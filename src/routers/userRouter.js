const { authguard } = require("../middlewares/authguard");
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

router.get("/change/:id", uncryptIds, requestChangeValidationMail);
router.post("/change/:id", uncryptIds, handleChangeValidationMail);
router.get("/mail/:id", uncryptIds, sendValidationMail);
router.get("/validate/:token", validateMail);

router.get("/dashboard", authguard, (req, res) => req.user.verified ?
      res.render("pages/dashboard.html.twig", { user: req.user }) :
      res.render("pages/unverified.html.twig", { userId: wt.sign({ id: req.user.id }, process.env.JWT_SHARING_ID, { expiresIn: "15m" }) })
);

module.exports = router;