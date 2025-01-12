const { MongoClient } = require('mongodb');
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const { generateTerraformVPC } = require('../utils/terraform');

const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

const handler = async (event, context) => {
  let client;
  try {
    const { name, cidrBlock } = JSON.parse(event.body);
    
    if (!name || !cidrBlock) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          success: false, 
          error: 'Name and CIDR block are required' 
        })
      };
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

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        code: terraformCode,
        message: 'VPC configuration saved successfully'
      })
    };
  } catch (error) {
    console.error('VPC generation error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        success: false, 
        error: 'Failed to generate VPC code',
        details: error.message 
      })
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};

exports.handler = handler;

