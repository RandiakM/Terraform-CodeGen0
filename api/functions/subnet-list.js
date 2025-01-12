const { MongoClient } = require('mongodb');

exports.handler = async function(event, context) {
  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    };
  }

  let client;
  try {
    client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();
    
    const subnets = await db.collection('user_inputs')
      .find({ type: 'subnet' })
      .toArray();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        subnets: subnets
      })
    };
  } catch (error) {
    console.error('Error fetching subnets:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        success: false, 
        error: 'Failed to fetch subnets',
        details: error.message 
      })
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};

