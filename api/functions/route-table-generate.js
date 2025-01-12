const { MongoClient } = require('mongodb');
const { generateTerraformRouteTable } = require('../utils/terraform');

const handler = async (event, context) => {
  let client;
  try {
    const { name, vpcId, routes } = JSON.parse(event.body);
    
    if (!name || !vpcId || !routes || !Array.isArray(routes) || routes.length === 0) {
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
          error: 'Name, VPC ID, and at least one route are required' 
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

    const terraformCode = generateTerraformRouteTable(name, vpc.name, routes);
    
    // Save user input
    const userInput = await db.collection('user_inputs').insertOne({
      type: 'route-table',
      name,
      vpcId,
      routes,
      timestamp: new Date()
    });

    // Save generated file
    await db.collection('generated_files').insertOne({
      type: 'route-table',
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
        message: 'Route Table configuration saved successfully'
      })
    };
  } catch (error) {
    console.error('Route Table generation error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        success: false, 
        error: 'Failed to generate Route Table code',
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

