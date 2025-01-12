const express = require('express');
const { generateRouteTable } = require('../controllers/routeTableController');

const router = express.Router();

router.post('/generate', generateRouteTable);

module.exports = router;

