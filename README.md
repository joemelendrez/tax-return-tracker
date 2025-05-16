# Tax Return Status Tracker - Setup Guide

This document will guide you through setting up your own Tax Return Status Tracker website.

## What This Application Does

This application creates a simple website where your clients can check the status of their tax returns. They simply enter their name, email, or client ID, and they can see:

- Current status of their return
- Position in your queue (automatically calculated based on status)
- Estimated completion date
- Visual progress indicator

## Setup Process (30-45 minutes)

### Part 1: Setting Up Your Google Sheet (5 minutes)

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. In the first row (Row 1), add these column headers:
   - A: id
   - B: name
   - C: email
   - D: status
   - E: position
   - F: estimatedCompletion

3. Fill the spreadsheet with your client data:
   - **id**: A unique identifier for each client (e.g., "001", "002")
   - **name**: Client's full name
   - **email**: Client's email address
   - **status**: Use one of these values: "In Queue", "Awaiting Documents", "In Progress", "Review", "Completed"
   - **position**: (Optional) You can leave this blank as positions are now automatically calculated!
   - **estimatedCompletion**: Estimated completion date (e.g., "5/25/2025")

4. Click "Share" in the top-right corner and select "Anyone with the link can view"
5. Copy the spreadsheet ID from the URL (the long string between /d/ and /edit in the URL)

### Part 2: Setting Up Google Cloud Project (15 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (click the project dropdown at the top and select "New Project")
3. Give your project a name (e.g., "Tax Return Tracker") and click "Create"
4. Select your new project from the dropdown if not already selected
5. In the left menu, go to "APIs & Services" > "Library"
6. Search for "Google Sheets API" and click on it
7. Click "Enable"
8. Go back to "APIs & Services" > "Credentials"
9. Click "Create Credentials" and select "OAuth client ID"
10. If prompted to configure the consent screen:
    - Select "External" user type and click "Create"
    - Fill in required fields (App name, User support email, Developer contact information)
    - Click "Save and Continue" through the next screens
    - Click "Back to Dashboard" when complete

11. Return to "Credentials" and click "Create Credentials" > "OAuth client ID" again
12. Select "Web application" as the application type
13. Give it a name like "Tax Return Tracker Web Client"
14. Under "Authorized JavaScript origins", click "Add URI" and enter the domain where you'll host your app
    - For testing, add: `http://localhost:3000` and `http://localhost`
    - If you know your final domain, add it (e.g., `https://taxtracker.yourbusiness.com`)

15. Under "Authorized redirect URIs", click "Add URI" and add the same domains with `/oauth2callback` at the end
    - For testing: `http://localhost:3000/oauth2callback`
    - For your domain: `https://taxtracker.yourbusiness.com/oauth2callback`

16. Click "Create"
17. A popup will show your Client ID and Client Secret - copy the Client ID for later

### Part 3: Deploying Your Website (15-20 minutes)

#### Option A: Deploy with Netlify (Easiest)

1. Create a free account on [Netlify](https://www.netlify.com/)
2. Download the ZIP file I've provided with the application code
3. Extract the ZIP file to a folder on your computer
4. Open the file `src/config.js` in a text editor (like Notepad)
5. Replace the values with your information:
   ```js
   export const SPREADSHEET_ID = 'your-spreadsheet-id-here';
   export const CLIENT_ID = 'your-client-id-here';
   ```
6. Save the file
7. In Netlify, click "Sites" > "Add new site" > "Deploy manually"
8. Drag and drop the entire folder (after editing the config file) to the upload area
9. Wait for deployment to complete (1-2 minutes)
10. Netlify will give you a random URL (like https://random-name-123456.netlify.app)
11. Click "Domain settings" to set up a custom domain if desired

#### Option B: Deploy with GitHub Pages

Instructions included in the ZIP file's README for this alternative option.

## Using Your Tax Return Status Tracker

### For You (The Tax Preparer)

1. Keep your Google Sheet updated as you work through returns
2. For each client:
   - Update their "status" when it changes
   - The position will be calculated automatically!
   - Update their "estimatedCompletion" date as needed

3. You can share the website URL with all your clients

### For Your Clients

1. Clients visit your website URL
2. They enter their full name or email address
3. They instantly see their current status and estimated completion date

## Understanding Automatic Position Calculation

This Tax Return Tracker features automatic position calculation in two ways:

1. **In the Application**: The app automatically calculates positions based on status priority:
   - "In Progress" clients come first
   - Followed by "Review"
   - Then "Awaiting Documents"
   - Then "In Queue"
   - Completed returns don't show a position number

2. **In Google Sheets**: You can optionally set up formula-based calculation in your spreadsheet too. See the AUTOMATIC_POSITIONS.md file for detailed instructions.

## Troubleshooting

- **Website shows "Error loading data"**: Check that your Google Sheet is properly shared and the spreadsheet ID is correct
- **Search returns no results**: Make sure the client is searching with information that exactly matches what's in your spreadsheet
- **Authentication errors**: Ensure you've properly set up the Google Cloud OAuth consent screen

##Need Help?

If you encounter any issues, please contact your developer for assistance.