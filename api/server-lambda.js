const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const connectDB = require('./config/database');
const vpcRoutes = require('./routes/vpc');
const subnetRoutes = require('./routes/subnet');
const routeTableRoutes = require('./routes/routeTables');
const igwRoutes = require('./routes/igw');
const natRoutes = require('./routes/nat');
const terraformRoutes = require('./routes/terraform');

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use('/vpc', vpcRoutes);
app.use('/subnet', subnetRoutes);
app.use('/route-table', routeTableRoutes);
app.use('/igw', igwRoutes);
app.use('/nat', natRoutes);
app.use('/terraform', terraformRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Internal Server Error',
    details: err.message 
  });
});

// Export handler for Netlify Functions
exports.handler = serverless(app);

