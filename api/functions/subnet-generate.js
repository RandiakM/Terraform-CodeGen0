const { MongoClient } = require('mongodb');
const { generateTerraformSubnet } = require('../utils/terraform');

const handler = async (event, context) => {
  let client;
  try {
    const { name, vpcId, cidrBlock, az } = JSON.parse(event.body);
    
    if (!name || !vpcId || !cidrBlock || !az) {
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
          error: 'Name, VPC ID, CIDR block, and Availability Zone are required' 
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

    const terraformCode = generateTerraformSubnet(name, vpc.name, cidrBlock, az);
    
    // Save user input
    const userInput = await db.collection('user_inputs').insertOne({
      type: 'subnet',
      name,
      vpcId,
      cidrBlock,
      availabilityZone: az,
      timestamp: new Date()
    });

    // Save generated file
    await db.collection('generated_files').insertOne({
      type: 'subnet',
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
        message: 'Subnet configuration saved successfully'
      })
    };
  } catch (error) {
    console.error('Subnet generation error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        success: false, 
        error: 'Failed to generate Subnet code',
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

