const express = require('express');
const { generateNAT } = require('../controllers/natController');

const router = express.Router();

router.post('/generate', generateNAT);

module.exports = router;

