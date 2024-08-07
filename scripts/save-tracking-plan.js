const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Get environment variables
const planDir = process.env.PLAN_DIR;
const workspace = process.env.SEGMENT_WORKSPACE;
const trackingPlanId = process.env.SEGMENT_TRACKING_PLAN_ID;
const apiUrl = `https://api.segmentapis.com/tracking-plans/${workspace}/${trackingPlanId}/rules`;
const apiKey = process.env.SEGMENT_API_KEY;

console.log('API key:', apiKey);
console.log('API URL:', apiUrl);
console.log('Workspace:', workspace);
console.log('Tracking Plan ID:', trackingPlanId);

// Fetch the updated tracking plan rules
async function fetchUpdatedTrackingPlanRules() {
  try {
    const response = await axios.get(
      apiUrl,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Fetched updated tracking plan rules successfully:', response.data);

    // Save the response data to a JSON file
    const filePath = path.join(planDir, 'current-rules.json');
    fs.writeFileSync(filePath, JSON.stringify(response.data, null, 2));
    console.log('Saved updated tracking plan rules to:', filePath);
  } catch (error) {
    console.error('Error fetching updated tracking plan rules:', error.response ? error.response.data : error.message);
  }
}

fetchUpdatedTrackingPlanRules();
