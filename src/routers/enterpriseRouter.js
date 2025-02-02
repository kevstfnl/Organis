const { addMember, displayEditMember, editMember, removeMember } = require('../controllers/enterpriseController');
const { authguard } = require('../middlewares/authguard');

const router = require('express').Router();

/**
 * TODO Enterprise management
 * - Add / Remove / Edit employe
 * - Add / Remove / Edit employe's material
 * - Add / Remove / Edit employe's event-task
 */


router.get("/add/user", authguard, (req, res) => res.render("pages/dashboard/addmember.html.twig", { user: req.user }));
router.post("/add/user", authguard, addMember);

router.get("/edit/member/:id", authguard, displayEditMember);
router.post("/edit/member/:id", authguard, editMember);
router.get("/remove/member/:id", authguard, removeMember);

module.exports = router;