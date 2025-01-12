const { generateTerraformIGW } = require('../utils/terraform');
const { saveUserInput, saveGeneratedFile, getVpcById } = require('../models/terraformModel');
const mongoose = require('mongoose');

exports.generateIGW = async (req, res) => {
  try {
    const { name, vpcId } = req.body;
    
    // Input validation
    if (!name || !vpcId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name and VPC ID are required' 
      });
    }

    // Validate VPC ID format
    if (!mongoose.Types.ObjectId.isValid(vpcId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid VPC ID format'
      });
    }

    // Verify VPC exists
    try {
      const vpc = await getVpcById(vpcId);
      if (!vpc) {
        return res.status(404).json({
          success: false,
          error: 'VPC not found'
        });
      }

      // Generate Terraform code using the VPC name from the database
      const terraformCode = generateTerraformIGW(name, vpc.name);
      
      // Save user input
      const userInput = await saveUserInput({
        type: 'igw',
        name,
        vpcId
      });

      // Save generated file
      const generatedFile = await saveGeneratedFile({
        type: 'igw',
        code: terraformCode,
        userInput: userInput._id
      });

      res.json({
        success: true,
        code: terraformCode,
        message: 'Internet Gateway configuration saved successfully'
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
    console.error('Internet Gateway generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate Internet Gateway code',
      details: error.message 
    });
  }
};

