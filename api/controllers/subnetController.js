const { generateTerraformSubnet } = require('../utils/terraform');
const { saveUserInput, saveGeneratedFile, getVpcById } = require('../models/terraformModel');
const mongoose = require('mongoose');

exports.generateSubnet = async (req, res) => {
  try {
    const { name, vpcId, cidrBlock, az } = req.body;
    
    // Input validation
    if (!name || !vpcId || !cidrBlock || !az) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required: name, vpcId, cidrBlock, and az' 
      });
    }

    // Validate VPC ID format
    if (!mongoose.Types.ObjectId.isValid(vpcId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid VPC ID format'
      });
    }

    // Validate CIDR block format
    const cidrRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}\/[0-9]{1,2}$/;
    if (!cidrRegex.test(cidrBlock)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid CIDR block format. Expected format: x.x.x.x/x (e.g., 10.0.1.0/24)'
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

      // Validate that subnet CIDR is within VPC CIDR
      // This is a basic check that could be enhanced with proper CIDR validation
      const vpcFirstOctet = vpc.cidrBlock.split('.')[0];
      const subnetFirstOctet = cidrBlock.split('.')[0];
      if (vpcFirstOctet !== subnetFirstOctet) {
        return res.status(400).json({
          success: false,
          error: 'Subnet CIDR block must be within VPC CIDR range'
        });
      }
    } catch (vpcError) {
      console.error('Error verifying VPC:', vpcError);
      return res.status(400).json({
        success: false,
        error: 'Invalid VPC ID'
      });
    }

    // Generate Terraform code
    const terraformCode = generateTerraformSubnet(name, vpcId, cidrBlock, az);
    
    try {
      // Save user input
      const userInput = await saveUserInput({
        type: 'subnet',
        name,
        vpcId,
        cidrBlock,
        availabilityZone: az
      });

      // Save generated file
      const generatedFile = await saveGeneratedFile({
        type: 'subnet',
        code: terraformCode,
        userInput: userInput._id
      });

      res.json({
        success: true,
        code: terraformCode,
        message: 'Subnet configuration saved successfully'
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      res.status(500).json({
        success: false,
        error: 'Failed to save to database',
        code: terraformCode,
        details: dbError.message
      });
    }
  } catch (error) {
    console.error('Subnet generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate Subnet code',
      details: error.message 
    });
  }
};

