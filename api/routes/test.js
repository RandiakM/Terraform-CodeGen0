const express = require("express");
const { saveToFauna, getAllFromFauna } = require("../models/terraformModel");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Test write operation
    const testData = { test: "data", timestamp: new Date().toISOString() };
    const saveResult = await saveToFauna("user_inputs", testData);
    console.log("Test save result:", saveResult);

    // Test read operation
    const allData = await getAllFromFauna("user_inputs");
    console.log("All data:", allData);

    res.json({
      success: true,
      message: "Database connection test successful",
      saveResult,
      allData,
    });
  } catch (error) {
    console.error("Database test error:", error);
    res.status(500).json({
      success: false,
      error: "Database connection test failed",
      details: error.message,
    });
  }
});

module.exports = router;
