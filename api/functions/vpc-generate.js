const { MongoClient } = require('mongodb');
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const { generateTerraformVPC } = require('../utils/terraform');

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.post('/', async (req, res) => {
  let client;
  try {
    const { name, cidrBlock } = req.body;
    
    if (!name || !cidrBlock) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name and CIDR block are required' 
      });
    }

    client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();

    const terraformCode = generateTerraformVPC(name, cidrBlock);
    
    // Save user input
    const userInput = await db.collection('user_inputs').insertOne({
      type: 'vpc',
      name,
      cidrBlock,
      timestamp: new Date()
    });

    // Save generated file
    await db.collection('generated_files').insertOne({
      type: 'vpc',
      code: terraformCode,
      userInput: userInput.insertedId,
      timestamp: new Date()
    });

    res.json({
      success: true,
      code: terraformCode,
      message: 'VPC configuration saved successfully'
    });
  } catch (error) {
    console.error('VPC generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate VPC code',
      details: error.message 
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

exports.handler = serverless(app);

