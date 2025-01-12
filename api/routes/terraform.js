const express = require('express');
const { generateFinalTerraform } = require('../controllers/terraformController');

const router = express.Router();

router.get('/generate-final', generateFinalTerraform);

module.exports = router;

