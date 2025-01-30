const { addmaterial, editmaterial, displayEditmaterial, deleteMaterial, assignMaterial } = require("../controllers/materialController");
const { authguard } = require("../middlewares/authguard");

const router = require("express").Router();

router.get("/add/material", authguard, (req, res) => res.render("pages/dashboard/addmaterial.html.twig", { user: req.user }));
router.post("/add/material", authguard, addmaterial);

router.get("/edit/material/:id", authguard, displayEditmaterial);
router.post("/edit/material/:id", authguard, editmaterial);

router.get("/delete/material/:id", authguard, deleteMaterial);


router.post("/assign/:id", authguard, assignMaterial)

module.exports = router;