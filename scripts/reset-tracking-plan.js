const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Get environment variables
const planDir = process.env.PLAN_DIR;
const trackingPlanId = process.env.SEGMENT_TRACKING_PLAN_ID;
const apiUrl = `https://api.segmentapis.com/tracking-plans/${trackingPlanId}/rules`;
const apiKey = process.env.SEGMENT_API_KEY;

console.log('API key:', apiKey);
console.log('API URL:', apiUrl);
console.log('Tracking Plan ID:', trackingPlanId);

// Function to reset the tracking plan
async function resetTrackingPlan() {
  // File path to the JSON file containing the new rules
  const filePath = path.join(planDir, 'current-rules.json');
  console.log('Reading rules from file:', filePath);

  // Read the JSON file
  let rulesData;
  try {
    rulesData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log('Loaded rules:', rulesData);
  } catch (error) {
    console.error('Error reading file:', error.message);
    return;
  }

  // Make the PUT request to reset the tracking plan rules
  try {
    const response = await axios.put(
      apiUrl,
      { rules: rulesData.rules },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
      }
    );
    console.log('Tracking plan successfully reset:', response.data);
  } catch (error) {
    console.error('Error resetting tracking plan:', error.response ? error.response.data : error.message);
  }
}

// Run the reset function
resetTrackingPlan();
