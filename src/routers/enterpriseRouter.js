const router = require('express').Router();
const enterpriseController = require('../controllers/enterpriseController');

router.post("/register", enterpriseController.register);

module.exports = router;