const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const axios = require('axios');

// Get environment variables
const planDir = process.env.PLAN_DIR;
const trackingPlanId = process.env.SEGMENT_TRACKING_PLAN_ID;
const apiUrl = `https://api.segmentapis.com/tracking-plans/${trackingPlanId}/rules?count=50`;
const apiKey = process.env.SEGMENT_API_KEY;

console.log('API key:', apiKey);
console.log('API URL:', apiUrl);
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

// Function to format properties and collect required fields
function formatProperties(properties) {
  const formattedProperties = {};
  const requiredFields = [];

  for (const [key, value] of Object.entries(properties)) {
    formattedProperties[key] = { ...value };
    if (value.required === true) {
      requiredFields.push(key);
      delete formattedProperties[key].required;
    }
    if (value.properties) {
      const result = formatProperties(value.properties);
      formattedProperties[key].properties = result.properties;
      if (result.required.length > 0) {
        formattedProperties[key].required = result.required;
      }
    }
  }

  return { properties: formattedProperties, required: requiredFields };
}

// Extract and format rules for the API
const rules = loadYamlFiles(planDir).map(rule => {
  const result = formatProperties(rule.properties);

  return {
    key: rule.key,
    type: rule.type,
    version: rule.version,
    jsonSchema: {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      properties: {
        context: { type: "object" },
        traits: { type: "object" },
        properties: {
          type: "object",
          properties: result.properties,
          required: result.required.length > 0 ? result.required : undefined
        }
      },
      required: ["properties"]
    }
  };
});

console.log('Request payload:', JSON.stringify({ rules }, null, 2));

// Update the tracking plan rules
async function updateTrackingPlanRules() {
  try {
    const response = await axios.patch(
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
    console.error('Error updating tracking plan rules:', error.response ? error.response.data : error.message);
  }
}

updateTrackingPlanRules();
