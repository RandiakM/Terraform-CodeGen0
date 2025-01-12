const { MongoClient } = require('mongodb');
const { generateTerraformIGW } = require('../utils/terraform');

const handler = async (event, context) => {
  let client;
  try {
    const { name, vpcId } = JSON.parse(event.body);
    
    if (!name || !vpcId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ 
          success: false, 
          error: 'Name and VPC ID are required' 
        })
      };
    }

    client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();

    // Verify VPC exists
    const vpc = await db.collection('user_inputs').findOne({ 
      _id: vpcId, 
      type: 'vpc' 
    });

    if (!vpc) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({
          success: false,
          error: 'VPC not found'
        })
      };
    }

    const terraformCode = generateTerraformIGW(name, vpc.name);
    
    // Save user input
    const userInput = await db.collection('user_inputs').insertOne({
      type: 'igw',
      name,
      vpcId,
      timestamp: new Date()
    });

    // Save generated file
    await db.collection('generated_files').insertOne({
      type: 'igw',
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
        message: 'Internet Gateway configuration saved successfully'
      })
    };
  } catch (error) {
    console.error('Internet Gateway generation error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        success: false, 
        error: 'Failed to generate Internet Gateway code',
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

