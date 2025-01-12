const express = require('express');
const { getAllUserInputs, getAllGeneratedFiles } = require('../models/terraformModel');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const userInputs = await getAllUserInputs();
    const generatedFiles = await getAllGeneratedFiles();

    res.json({
      status: 'healthy',
      database: {
        connected: true,
        collections: {
          user_inputs: userInputs.length,
          generated_files: generatedFiles.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: {
        connected: false,
        error: error.message
      }
    });
  }
});

module.exports = router;

