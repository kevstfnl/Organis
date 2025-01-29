const { addmaterial, editmaterial, displayEditmaterial, deleteMaterial } = require("../controllers/materialController");
const { authguard } = require("../middlewares/authguard");

const router = require("express").Router();

router.get("/add/material", authguard, (req, res) => res.render("pages/dashboard/addmaterial.html.twig"));
router.post("/add/material", authguard, addmaterial);

router.get("/edit/material/:id", authguard, displayEditmaterial);
router.post("/edit/material/:id", authguard, editmaterial);

router.get("/delete/material/:id", authguard, deleteMaterial);

module.exports = router;