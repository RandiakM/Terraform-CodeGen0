# VPC Terraform Generator

## Introduction

The VPC Terraform Generator is a tool designed to generate Terraform code for AWS infrastructure components such as VPCs, Subnets, Route Tables, Internet Gateways (IGWs), and NAT Gateways. This project uses a microservices architecture and is hosted on Netlify, with MongoDB as the database.

## How to Use

The VPC Terraform Generator allows users to generate Terraform code for various AWS components through a web interface. Users can input the necessary details for each component, and the application will generate the corresponding Terraform code.

## Installation Steps

1. Clone the repository:

```
git clone https://github.com/your-repo/vpc-terraform-generator.git
cd vpc-terraform-generator
```

2. Install backend dependencies:

```
cd api
npm install
```

3. Install frontend dependencies:

```
cd ../frontend
npm install
```

4. Set up environment variables: Create a .env file in the api directory with the following content:

```
MONGODB_URI=your_mongodb_connection_string
```

5. Start the backend server:

```
cd ../api
npm run dev
```

6. Start the frontend server:

```
cd ../frontend
npm start
```

## Netlify Hosting Steps

1. Create a Netlify account: Sign up for a Netlify account at Netlify.

2. Connect your repository: Connect your GitHub repository to Netlify.

3. Configure build settings: In the Netlify dashboard, set the following build settings:

 - Base directory: /
 - Build command: cd frontend && npm install && CI=false npm run build
 - Publish directory: frontend/build

4. Set environment variables: In the Netlify dashboard, set the following environment variables:

 - NODE_VERSION: 18
 - MONGODB_URI: your_mongodb_connection_string

5. Deploy the site: Click the "Deploy" button in the Netlify dashboard to deploy your site.

## User Guide

1. Access the application: Open the deployed application in your web browser. using [Terraform-CodeGen0 App](https://terraform-codegen0.netlify.app/)

2. Generate VPC:

 - Navigate to the "VPC" section.
 - Enter the VPC name and CIDR block.
 - Click "Generate" to generate the Terraform code for the VPC.

3. Generate Subnet:

 - Navigate to the "Subnet" section.
 - Enter the Subnet name, select the VPC, enter the CIDR block, and select the Availability Zone.
 - Click "Generate" to generate the Terraform code for the Subnet.

4. Generate Route Table:

 - Navigate to the "Route Table" section.
 - Enter the Route Table name, select the VPC, and add routes.
 - Click "Generate" to generate the Terraform code for the Route Table.

5. Generate Internet Gateway:

 - Navigate to the "Internet Gateway" section.
 - Enter the Internet Gateway name and select the VPC.
 - Click "Generate" to generate the Terraform code for the Internet Gateway.

6. Generate NAT Gateway:

 - Navigate to the "NAT Gateway" section.
 - Enter the NAT Gateway name, select the Subnet, and enter the Allocation ID.
 - Click "Generate" to generate the Terraform code for the NAT Gateway.

7. Generate Final Terraform File: