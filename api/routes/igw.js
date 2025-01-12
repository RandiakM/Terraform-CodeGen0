const express = require('express');
const { generateIGW } = require('../controllers/igwController');

const router = express.Router();

router.post('/generate', generateIGW);

module.exports = router;

