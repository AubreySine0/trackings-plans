const fs = require('fs');
const path = require('path');
const os = require('os');

// Get arguments from the command line
const tpTitle = process.argv[2];
const jsonSourcePath = process.argv[3];
const markdownTargetPath = process.argv[4];

// Load the JSON data using fs.readFileSync and JSON.parse  test
const jsonPath = path.resolve(jsonSourcePath);
const jsonData = fs.readFileSync(jsonPath, 'utf8');
const json = JSON.parse(jsonData);

/// CHANGE 1 - rename .data.trackingPlan. to .rules. ///
const trackEvents = json.rules;

let formattedEvents = [];
let header = tpTitle + '\n';
formattedEvents.push(header);
for (let event of trackEvents) {
    let formattedEvent = [];
    formattedEvent.push('\n');

    formattedEvent.push('### ' + event.key + '\n');
    let eventData = event.jsonSchema.properties;

    formattedEvent.push('<!-- tabs:start -->');
    formattedEvent.push('#### **Basics**' + '\n');
    formattedEvent.push(event.description);
    formattedEvent.push('#### **Properties**' + '\n');
    formattedEvent.push('|**Name** | `Type` | Description | Required?|');
    formattedEvent.push('| :--- | :--- | :--- | :---|' );
    for (let propName in eventData.properties.properties) {
        let propData = eventData.properties;
        let propType = propData.properties[propName].type;
        formattedEvent.push('|**' + propName  + '** | `' + propType + '` |...|Required/Optional|' );
    }

    formattedEvent.push('#### **JS**'+ '\n');
    formattedEvent.push('```javascript');
    formattedEvent.push('analytics.track("'+ event.name +'" {');

    for (let propName in eventData.properties.properties) {
        let propData = eventData.properties;
        let propType = propData.properties[propName].type;
        formattedEvent.push('"' + propName  + '": "<<' + propType + '>>"' );
    }
    formattedEvent.push('});');
    formattedEvent.push('```' + ' \n');
    formattedEvent.push('<!-- tabs:end -->' + '\n');
    formattedEvent.push('<!-- panels:end -->' + '\n');
    formattedEvents.push.apply(formattedEvents, formattedEvent);
}

let eventsMarkdown = formattedEvents.join(os.EOL);
fs.writeFileSync(markdownTargetPath, eventsMarkdown, 'utf-8');
