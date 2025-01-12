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
    
    const vpcs = await db.collection('user_inputs')
      .find({ type: 'vpc' })
      .toArray();

    res.json({
      success: true,
      vpcs: vpcs
    });
  } catch (error) {
    console.error('Error fetching VPCs:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch VPCs',
      details: error.message 
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
});

exports.handler = serverless(app);

