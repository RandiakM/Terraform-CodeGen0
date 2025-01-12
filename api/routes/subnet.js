const express = require('express');
const { generateSubnet } = require('../controllers/subnetController');
const { getAllUserInputs } = require('../models/terraformModel');

const router = express.Router();

router.post('/generate', generateSubnet);

// Add endpoint to list subnets
router.get('/list', async (req, res) => {
  try {
    const subnets = await getAllUserInputs();
    const filteredSubnets = subnets.filter(input => input.type === 'subnet');
    res.json({ 
      success: true, 
      subnets: filteredSubnets 
    });
  } catch (error) {
    console.error('Error fetching subnets:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch subnets' 
    });
  }
});

module.exports = router;

