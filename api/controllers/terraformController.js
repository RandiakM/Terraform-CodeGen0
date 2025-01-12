const { getAllGeneratedFiles } = require('../models/terraformModel');

exports.generateFinalTerraform = async (req, res) => {
  try {
    const generatedFiles = await getAllGeneratedFiles();
    
    let finalTerraformCode = '';
    
    // Sort files by type to ensure consistent order
    const sortedFiles = generatedFiles.sort((a, b) => {
      const order = ['vpc', 'subnet', 'igw', 'nat', 'route-table'];
      return order.indexOf(a.type) - order.indexOf(b.type);
    });

    for (const file of sortedFiles) {
      finalTerraformCode += `# ${file.type.toUpperCase()} Configuration\n`;
      finalTerraformCode += file.code;
      finalTerraformCode += '\n\n';
    }

    res.json({
      success: true,
      code: finalTerraformCode,
      message: 'Final Terraform configuration generated successfully'
    });
  } catch (error) {
    console.error('Error generating final Terraform code:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate final Terraform code',
      details: error.message 
    });
  }
};

