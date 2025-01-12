require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const healthRoutes = require('./routes/health');
const vpcRoutes = require('./routes/vpc');
const subnetRoutes = require('./routes/subnet');
const routeTableRoutes = require('./routes/routeTables');
const igwRoutes = require('./routes/igw');
const natRoutes = require('./routes/nat');
const terraformRoutes = require('./routes/terraform');

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not set');
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

app.use('/health', healthRoutes);
app.use('/api/vpc', vpcRoutes);
app.use('/api/subnet', subnetRoutes);
app.use('/api/route-table', routeTableRoutes);
app.use('/api/igw', igwRoutes);
app.use('/api/nat', natRoutes);
app.use('/api/terraform', terraformRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Internal Server Error',
    details: err.message 
  });
});

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});

module.exports = app;

