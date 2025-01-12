const { generateTerraformRouteTable } = require('../utils/terraform');
const { saveUserInput, saveGeneratedFile, getVpcById } = require('../models/terraformModel');
const mongoose = require('mongoose');

exports.generateRouteTable = async (req, res) => {
  try {
    const { name, vpcId, routes } = req.body;
    
    // Input validation
    if (!name || !vpcId || !routes || !Array.isArray(routes) || routes.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, VPC ID, and at least one route are required' 
      });
    }

    // Validate routes format
    for (const route of routes) {
      if (!route.cidrBlock || !route.gatewayId) {
        return res.status(400).json({
          success: false,
          error: 'Each route must have a cidrBlock and gatewayId'
        });
      }
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
    } catch (vpcError) {
      console.error('Error verifying VPC:', vpcError);
      return res.status(400).json({
        success: false,
        error: 'Invalid VPC ID'
      });
    }

    // Generate Terraform code
    const terraformCode = generateTerraformRouteTable(name, vpcId, routes);
    
    try {
      // Save user input
      const userInput = await saveUserInput({
        type: 'route-table',
        name,
        vpcId,
        routes
      });

      // Save generated file
      const generatedFile = await saveGeneratedFile({
        type: 'route-table',
        code: terraformCode,
        userInput: userInput._id
      });

      res.json({
        success: true,
        code: terraformCode,
        message: 'Route Table configuration saved successfully'
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
    console.error('Route Table generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate Route Table code',
      details: error.message 
    });
  }
};

