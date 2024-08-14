const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Get environment variables
const planDir = process.env.PLAN_DIR;
const workspace = process.env.SEGMENT_WORKSPACE;
const trackingPlanId = process.env.SEGMENT_TRACKING_PLAN_ID;
const apiUrl = `https://api.segmentapis.com/tracking-plans/${trackingPlanId}/rules`;
const apiKey = process.env.SEGMENT_API_KEY;
const paginationCount = 100; // Fixed pagination count

console.log('API key:', apiKey);
console.log('API URL:', apiUrl);
console.log('Workspace:', workspace);
console.log('Tracking Plan ID:', trackingPlanId);
console.log('Pagination Count:', paginationCount);

// Fetch the updated tracking plan rules with pagination
async function fetchUpdatedTrackingPlanRules(cursor = null, accumulatedRules = []) {
  try {
    // Construct the API URL with query parameters for pagination
    let requestUrl = `${apiUrl}?count=${paginationCount}`;
    if (cursor) {
      requestUrl += `&cursor=${cursor}`;
    }

    const response = await axios.get(
      requestUrl,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
      }
    );

    console.log('Fetched page successfully:', response.data);

    // Accumulate the rules from this page
    const rules = response.data.data.rules || [];
    accumulatedRules = accumulatedRules.concat(rules);
    console.log('Accumulated rules so far:', accumulatedRules.length);

    // Handle pagination if there's more data
    if (response.data.data.pagination && response.data.data.pagination.next) {
      console.log('Fetching next page...');
      return await fetchUpdatedTrackingPlanRules(response.data.data.pagination.next, accumulatedRules);
    } else {
      console.log('All pages fetched.');
      return accumulatedRules;
    }
  } catch (error) {
    console.error('Error fetching updated tracking plan rules:', error.response ? error.response.data : error.message);
    return accumulatedRules;
  }
}

// Main function to fetch and save all rules
async function main() {
  const allRules = await fetchUpdatedTrackingPlanRules();

  console.log('Total rules fetched:', allRules.length);

  // File path for saving the rules
  const filePath = path.join(planDir, 'current-rules.json');
  console.log('Final file path:', filePath);

  // Save all accumulated rules to a single JSON file
  try {
    fs.writeFileSync(filePath, JSON.stringify({ rules: allRules }, null, 2));
    console.log('Saved all rules to:', filePath);
  } catch (error) {
    console.error('Error writing file:', error.message);
  }
}

// Run the main function
main();