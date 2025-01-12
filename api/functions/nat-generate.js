const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');

exports.handler = async function(event, context) {
  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }

  let client;
  try {
    const { name, subnetId, allocationId } = JSON.parse(event.body);
    
    // Input validation
    if (!name || !subnetId || !allocationId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({ 
          success: false, 
          error: 'Name, Subnet ID, and Allocation ID are required' 
        })
      };
    }

    client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();

    // Verify Subnet exists
    const subnet = await db.collection('user_inputs').findOne({ 
      _id: new ObjectId(subnetId),
      type: 'subnet' 
    });

    if (!subnet) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({
          success: false,
          error: 'Subnet not found'
        })
      };
    }

    // Generate Terraform code
    const terraformCode = `
resource "aws_nat_gateway" "${name}" {
  allocation_id = "${allocationId}"
  subnet_id     = aws_subnet.${subnet.name}.id

  tags = {
    Name = "${name}"
  }

  # Ensure the Internet Gateway is created first
  depends_on = [aws_internet_gateway.main]
}`;
    
    // Save user input
    const userInput = await db.collection('user_inputs').insertOne({
      type: 'nat',
      name,
      subnetId: new ObjectId(subnetId),
      allocationId,
      timestamp: new Date()
    });

    // Save generated file
    await db.collection('generated_files').insertOne({
      type: 'nat',
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
        message: 'NAT Gateway configuration saved successfully'
      })
    };
  } catch (error) {
    console.error('NAT Gateway generation error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        success: false, 
        error: 'Failed to generate NAT Gateway code',
        details: error.message 
      })
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};

