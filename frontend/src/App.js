'use client';

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import VPCForm from './components/VPCForm';
import SubnetForm from './components/SubnetForm';
import RouteTableForm from './components/RouteTableForm';
import IGWForm from './components/IGWForm';
import NATForm from './components/NATForm';
import FinalTerraformGenerator from './components/FinalTerraformGenerator';

const App = () => {
  return (
    <Router>
      <div className="container mx-auto p-4">
        <nav className="mb-4">
          <ul className="flex space-x-4">
            <li><Link to="/" className="text-blue-500 hover:text-blue-700">Home</Link></li>
            <li><Link to="/vpc" className="text-blue-500 hover:text-blue-700">VPC</Link></li>
            <li><Link to="/subnet" className="text-blue-500 hover:text-blue-700">Subnet</Link></li>
            <li><Link to="/route-table" className="text-blue-500 hover:text-blue-700">Route Table</Link></li>
            <li><Link to="/igw" className="text-blue-500 hover:text-blue-700">Internet Gateway</Link></li>
            <li><Link to="/nat" className="text-blue-500 hover:text-blue-700">NAT Gateway</Link></li>
            <li><Link to="/final" className="text-blue-500 hover:text-blue-700">Final Terraform</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<h1 className="text-2xl font-bold">Welcome to Terraform Code Generator</h1>} />
          <Route path="/vpc" element={<VPCForm />} />
          <Route path="/subnet" element={<SubnetForm />} />
          <Route path="/route-table" element={<RouteTableForm />} />
          <Route path="/igw" element={<IGWForm />} />
          <Route path="/nat" element={<NATForm />} />
          <Route path="/final" element={<FinalTerraformGenerator />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

