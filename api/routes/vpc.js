const express = require('express');
const { generateVPC } = require('../controllers/vpcController');
const { getAllUserInputs } = require('../models/terraformModel');

const router = express.Router();

router.post('/generate', generateVPC);

// Add endpoint to list VPCs
router.get('/list', async (req, res) => {
  try {
    const vpcs = await getAllUserInputs();
    const filteredVpcs = vpcs.filter(input => input.type === 'vpc');
    res.json({ 
      success: true, 
      vpcs: filteredVpcs 
    });
  } catch (error) {
    console.error('Error fetching VPCs:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch VPCs' 
    });
  }
});

module.exports = router;

