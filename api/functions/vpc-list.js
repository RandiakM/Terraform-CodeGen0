const { MongoClient } = require('mongodb');

// Export the handler function directly
exports.handler = async function(event, context) {
  let client;
  try {
    client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();
    
    const vpcs = await db.collection('user_inputs')
      .find({ type: 'vpc' })
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
        vpcs: vpcs
      })
    };
  } catch (error) {
    console.error('Error fetching VPCs:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        success: false, 
        error: 'Failed to fetch VPCs',
        details: error.message 
      })
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};

