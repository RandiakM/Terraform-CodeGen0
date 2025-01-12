exports.generateTerraformVPC = (name, cidrBlock) => {
    return `
  resource "aws_vpc" "${name}" {
    cidr_block = "${cidrBlock}"
    enable_dns_hostnames = true
    enable_dns_support = true
  
    tags = {
      Name = "${name}"
    }
  }
  `;
  };
  
  exports.generateTerraformSubnet = (name, vpcId, cidrBlock, az) => {
    return `
  resource "aws_subnet" "${name}" {
    vpc_id            = "${vpcId}"
    cidr_block        = "${cidrBlock}"
    availability_zone = "${az}"
  
    tags = {
      Name = "${name}"
    }
  }
  `;
  };
  
  exports.generateTerraformRouteTable = (name, vpcId, routes) => {
    const routeEntries = routes.map((route, index) => `
    route {
      cidr_block = "${route.cidrBlock}"
      gateway_id = "${route.gatewayId}"
    }`).join('\n');
  
    return `
  resource "aws_route_table" "${name}" {
    vpc_id = "${vpcId}"
  ${routeEntries}
  
    tags = {
      Name = "${name}"
    }
  }
  `;
  };
  
  exports.generateTerraformIGW = (name, vpcName) => {
    return `
  resource "aws_internet_gateway" "${name}" {
    vpc_id = aws_vpc.${vpcName}.id
  
    tags = {
      Name = "${name}"
    }
  }
  `;
  };
  
  exports.generateTerraformNAT = (name, subnetName, allocationId) => {
    return `
  resource "aws_nat_gateway" "${name}" {
    allocation_id = "${allocationId}"
    subnet_id     = aws_subnet.${subnetName}.id
  
    tags = {
      Name = "${name}"
    }
  
    # Ensure the Internet Gateway is created first
    depends_on = [aws_internet_gateway.main]
  }
  `;
  };
  
  