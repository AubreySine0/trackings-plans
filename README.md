# trackings-plans
a repository that demonstrates the power of GitHub workflows to enhance management of a Segment Tracking Plan

![Alt text](![Aubrey's Automated TP Management - Aubrey Final Setup Draft](https://github.com/user-attachments/assets/83d617e5-8f52-40b1-afd8-956010b4d662))

## instructions for use

### clone this repository
### create env secrets 
this project will need the following github respoitory secrets 
- `SEGMENT_PUBLIC_API_TOKEN`
- `DEV_SEGMENT_TRACKING_PLAN_ID_<TP_NAME>` * n number of trackplans
- `PROD_SEGMENT_TRACKING_PLAN_ID_<TP_NAME>` * n number of tracking plans
  - This repo uses a javascript & server tracking plans
  - Which means I have **5** total github secrets
    - 1 for the public api
    - 2 for javascript (dev & prod)
    - 2 for server (dev & prod)  

## HOW IT WORKS 

### STEP 1:

#### NEW RULE IN `tracking-rules/<TP_NAME>/**.yml` PUSHED TO BRANCH 

- Any changes to rules located in `tracking-rules/server` or `tracking-rules/javascript` pushed to a **new branch** will trigger **DEV** workflow
  - `update-and-save-tracking-plans` does the following
    - takes the changed yaml files and converts the rule to JSON
    - `PATCH` update rules to update the Segment DEV tracking plan
      - **NOTE** you can make changes to multilpe changes in a single branch. the workflow checks to make sure rules have been updated
    - `GET` rules endpoint (Segment Public API) and saves the output to `plans/dev/<TP_NAME>/current-rules.json` 
    - Add, commit, and push files to branch        

### STEP 2

#### MERGE BRANCH TO MAIN

- Any changes to rules located in `tracking-rules/server` or `tracking-rules/javascript` from **merged branch to main** trigger **PROD** workflow 
  -  `update-and-generate-markdown` does the following
    -  takes the changed yaml files and converts the rule to JSON
    - `PATCH` update rules to update the Segment PROD tracking plan
    - `GET` rules endpoint (Segment Public API) and saves the output to `plans/prod/<TP_NAME>/current-rules.json`
    -  `render-tp.js` outputs a markdown file using the new rules in `plans/prod/../current-rules.json` -> `docs/<TP_NAME>.md`
      -  `docs/<TP_NAME>.md` is defined by an arugment value in `update-prod-tracking-plans.yml`
    - Add, commit push to main
 
## ADVANCED FEATURES

### RESET_DEV

If a new release is created & the title is `RESET DEV` the following workflow will trigger:
- `GET` PROD tracking plan rules
- `PUT` **(replace all rules)** output from step 1 in `DEV` tracking plans (Segment)
- updates rules in `plans/dev/<TP_NAME>/current-rules.json`

### MARKDOWN
If rules are updated in the app and not via yaml the markdown data dictionary may get outdated.
- `GET` `PROD` rules
- `render-tp.js`

### Local node script
Reccommended to run locally, you can access generate-yaml-rules.js
- `npm install`
- `node scripts/generate-yaml-rules.js plans/prod/<TP_NAME> tracking-rules/rules/<TP_NAME>` 
    - you may need to create a directory `plans/rules/<TP_NAME>`
- Converts all PROD rules to their own unique yaml file for easy updates

