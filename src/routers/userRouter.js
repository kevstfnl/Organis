const { authguard } = require("../middlewares/authguard");
const { clearSignedCookieAndSession } = require("../utils/cookie");
const { login, update, sendForgotPasswordRequest, updateForgotPassword, sendUpdatePasswordRequest } = require("../controllers/userController");
const { register, sendValidationMail, validateMail, requestChangeValidationMail, handleChangeValidationMail } = require("../controllers/registerController");
const { uncryptIds } = require("../middlewares/idSharing");
const { PrismaClient } = require("@prisma/client");
const router = require("express").Router();
const prisma = new PrismaClient();

router.get("/login", (req, res) => res.render("pages/login.html.twig"));
router.post("/login", login);
router.get("/register", (req, res) => res.render("pages/register.html.twig"));
router.post("/register", register);
router.get("/logout", authguard, async (req, res) => {
      await prisma.token.deleteMany({
            where: {
                  userId: req.user.id
            }
      })
      clearSignedCookieAndSession(req, res, "refreshToken");
      res.redirect("/");
});

router.get("/change/:id", uncryptIds, requestChangeValidationMail);
router.post("/change/:id", uncryptIds, handleChangeValidationMail);
router.get("/mail/:id", uncryptIds, sendValidationMail);
router.get("/validate/:token", validateMail);

router.get("/forgotpassword", (req, res) => res.render("pages/mails/forgotpass.html.twig"));
router.post("/forgotpassword", sendForgotPasswordRequest);
router.get("/changepass/:token", (req, res) => res.render("pages/mails/changeforgotpass.html.twig", {token: req.params.token}));
router.post("/changepass/:token", updateForgotPassword);


router.get("/changepassword", authguard, (req, res) => res.render("pages/mails/changepass.html.twig"));
router.post("/changepassword", authguard, sendUpdatePasswordRequest);


router.get("/dashboard", authguard, (req, res) => req.user.verified ?
      res.render("pages/dashboard.html.twig", { user: req.user }) :
      res.render("pages/unverified.html.twig", { userId: wt.sign({ id: req.user.id }, process.env.JWT_SHARING_ID, { expiresIn: "15m" }) })
);

router.get("/profile", authguard, (req, res) => res.render("pages/profile/profile.html.twig", { user: req.user }));
router.post("/profile", authguard, update);

module.exports = router;