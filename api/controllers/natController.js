const { generateTerraformNAT } = require('../utils/terraform');
const { saveUserInput, saveGeneratedFile, getSubnetById } = require('../models/terraformModel');
const mongoose = require('mongoose');

exports.generateNAT = async (req, res) => {
  try {
    const { name, subnetId, allocationId } = req.body;
    
    // Input validation
    if (!name || !subnetId || !allocationId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, Subnet ID, and Allocation ID are required' 
      });
    }

    // Validate Subnet ID format
    if (!mongoose.Types.ObjectId.isValid(subnetId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Subnet ID format'
      });
    }

    // Verify Subnet exists
    try {
      const subnet = await getSubnetById(subnetId);
      if (!subnet) {
        return res.status(404).json({
          success: false,
          error: 'Subnet not found'
        });
      }

      // Generate Terraform code using the subnet name from the database
      const terraformCode = generateTerraformNAT(name, subnet.name, allocationId);
      
      // Save user input
      const userInput = await saveUserInput({
        type: 'nat',
        name,
        subnetId,
        allocationId
      });

      // Save generated file
      const generatedFile = await saveGeneratedFile({
        type: 'nat',
        code: terraformCode,
        userInput: userInput._id
      });

      res.json({
        success: true,
        code: terraformCode,
        message: 'NAT Gateway configuration saved successfully'
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      res.status(500).json({
        success: false,
        error: 'Failed to save to database',
        details: dbError.message
      });
    }
  } catch (error) {
    console.error('NAT Gateway generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate NAT Gateway code',
      details: error.message 
    });
  }
};

