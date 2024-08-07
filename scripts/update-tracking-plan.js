const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const axios = require('axios');

// Directory containing YAML files
const dirPath = './tracking-rules';

// Define the API endpoint
const workspace = process.env.SEGMENT_WORKSPACE_SLUG;
const trackingPlanId = process.env.SEGMENT_TRACKING_PLAN_ID;
const apiUrl = `https://api.segmentapis.com/tracking-plans/${trackingPlanId}/rules?count=50`;

// Define the API key
const apiKey = process.env.SEGMENT_PUBLIC_API_TOKEN;
console.log('API key:', apiKey);
console.log('API URL:', apiUrl);
console.log('Workspace:', workspace);
console.log('Tracking Plan ID:', trackingPlanId);

// Function to load all YAML files from the directory
function loadYamlFiles(directory) {
  const files = fs.readdirSync(directory);
  let allRules = [];

  files.forEach(file => {
    if (path.extname(file) === '.yml') {
      const fileContents = fs.readFileSync(path.join(directory, file), 'utf8');
      const data = yaml.load(fileContents);
      allRules = allRules.concat(data.rules);
    }
  });

  console.log('Loaded rules:', allRules);

  return allRules;
}

// Extract and format rules for the API
const rules = loadYamlFiles(dirPath).map(rule => ({
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

console.log('Request payload:', JSON.stringify({ rules }, null, 2));

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
