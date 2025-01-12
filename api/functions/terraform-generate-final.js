const { MongoClient } = require('mongodb');
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/', async (req, res) => {
  let client;
  try {
    client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();
    const generatedFiles = await db.collection('generated_files').find().toArray();
    
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
  } finally {
    if (client) {
      await client.close();
    }
  }
});

exports.handler = serverless(app);

