import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div>
      <h1>Terraform Code Generator</h1>
      <nav>
        <ul>
          <li><Link to="/vpc">Generate VPC</Link></li>
          <li><Link to="/subnet">Generate Subnet</Link></li>
          <li><Link to="/route-table">Generate Route Table</Link></li>
          <li><Link to="/igw">Generate Internet Gateway</Link></li>
          <li><Link to="/nat">Generate NAT Gateway</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default HomePage;

