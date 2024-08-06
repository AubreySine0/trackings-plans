const fs = require('fs');
const yaml = require('js-yaml');
const axios = require('axios');

// Load the YAML file
const fileContents = fs.readFileSync('./tracking-plan.yml', 'utf8');
const data = yaml.load(fileContents);

// Extract the rules from the YAML file
const rules = data.rules.map(rule => ({
  key: rule.key,
  type: rule.type,
  version: rule.version,
  jsonSchema: {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      context: {},
      traits: {
        type: "object"
      },
      properties: {
        type: "object",
        properties: rule.properties
      }
    }
  }
}));

// Define the API endpoint
const workspace = process.env.SEGMENT_WORKSPACE;
const trackingPlanId = process.env.SEGMENT_TRACKING_PLAN_ID;
const apiUrl = `https://api.segmentapis.com/tracking-plans/${workspace}/${trackingPlanId}/rules`;

// Define the API key
const apiKey = process.env.SEGMENT_API_KEY;

// Update the tracking plan rules
async function updateTrackingPlanRules() {
  try {
    const response = await axios.put(
      apiUrl,
      { rules },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Tracking plan rules updated successfully:', response.data);
  } catch (error) {
    console.error('Error updating tracking plan rules:', error);
  }
}

updateTrackingPlanRules();
