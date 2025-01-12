const { generateTerraformVPC } = require('../utils/terraform');
const { saveUserInput, saveGeneratedFile } = require('../models/terraformModel');

exports.generateVPC = async (req, res) => {
  try {
    const { name, cidrBlock } = req.body;
    
    if (!name || !cidrBlock) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name and CIDR block are required' 
      });
    }

    const terraformCode = generateTerraformVPC(name, cidrBlock);
    
    try {
      const userInput = await saveUserInput({
        type: 'vpc',
        name,
        cidrBlock
      });

      const generatedFile = await saveGeneratedFile({
        type: 'vpc',
        code: terraformCode,
        userInput: userInput._id
      });

      res.json({
        success: true,
        code: terraformCode,
        message: 'VPC configuration saved successfully'
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
    console.error('VPC generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate VPC code',
      details: error.message 
    });
  }
};

