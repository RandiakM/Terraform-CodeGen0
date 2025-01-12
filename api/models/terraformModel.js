const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  cidrBlock: {
    type: String,
    required: true
  },
  gatewayId: {
    type: String,
    required: true
  }
});

const userInputSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['vpc', 'subnet', 'route-table', 'igw', 'nat']
  },
  name: {
    type: String,
    required: true
  },
  cidrBlock: String,
  vpcId: String,
  subnetId: String,
  availabilityZone: String,
  allocationId: String,
  routes: [routeSchema],
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

const generatedFileSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['vpc', 'subnet', 'route-table', 'igw', 'nat']
  },
  code: {
    type: String,
    required: true
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  userInput: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'UserInput' 
  }
});

const UserInput = mongoose.model('UserInput', userInputSchema);
const GeneratedFile = mongoose.model('GeneratedFile', generatedFileSchema);

exports.saveUserInput = async (data) => {
  const userInput = new UserInput(data);
  return await userInput.save();
};

exports.saveGeneratedFile = async (data) => {
  const generatedFile = new GeneratedFile(data);
  return await generatedFile.save();
};

exports.getAllUserInputs = async () => {
  return await UserInput.find();
};

exports.getAllGeneratedFiles = async () => {
  return await GeneratedFile.find();
};

exports.getVpcById = async (id) => {
  return await UserInput.findOne({ _id: id, type: 'vpc' });
};

exports.getSubnetById = async (id) => {
  return await UserInput.findOne({ _id: id, type: 'subnet' });
};

