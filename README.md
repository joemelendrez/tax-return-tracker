Tax Return Status Tracker - Setup Guide
This document will guide you through setting up your own Tax Return Status Tracker website.
What This Application Does
This application creates a simple website where your clients can check the status of their tax returns. They simply enter their name, email, or client ID, and they can see:

Current status of their return
Position in your queue (automatically calculated based on status)
Estimated completion date
Visual progress indicator

Setup Process (30-45 minutes)
Part 1: Setting Up Your Google Sheet (5 minutes)

Go to Google Sheets and create a new spreadsheet
In the first row (Row 1), add these column headers:

A: id
B: name
C: email
D: status
E: position
F: estimatedCompletion


Fill the spreadsheet with your client data:

id: A unique identifier for each client (e.g., "001", "002")
name: Client's full name
email: Client's email address
status: Use one of these values: "In Queue", "Awaiting Documents", "In Progress", "Review", "Completed"
position: (Optional) You can leave this blank as positions are now automatically calculated!
estimatedCompletion: Estimated completion date (e.g., "5/25/2025")


Click "Share" in the top-right corner and select "Anyone with the link can view"
Copy the spreadsheet ID from the URL (the long string between /d/ and /edit in the URL)

Part 2: Setting Up Google Cloud Project (15 minutes)

Go to Google Cloud Console
Create a new project (click the project dropdown at the top and select "New Project")
Give your project a name (e.g., "Tax Return Tracker") and click "Create"
Select your new project from the dropdown if not already selected
In the left menu, go to "APIs & Services" > "Library"
Search for "Google Sheets API" and click on it
Click "Enable"
Go back to "APIs & Services" > "Credentials"
Click "Create Credentials" and select "OAuth client ID"
If prompted to configure the consent screen:

Select "External" user type and click "Create"
Fill in required fields (App name, User support email, Developer contact information)
Click "Save and Continue" through the next screens
Click "Back to Dashboard" when complete


Return to "Credentials" and click "Create Credentials" > "OAuth client ID" again
Select "Web application" as the application type
Give it a name like "Tax Return Tracker Web Client"
Under "Authorized JavaScript origins", click "Add URI" and enter the domain where you'll host your app

For testing, add: http://localhost:3000 and http://localhost
If you know your final domain, add it (e.g., https://taxtracker.yourbusiness.com)


Under "Authorized redirect URIs", click "Add URI" and add the same domains with /oauth2callback at the end

For testing: http://localhost:3000/oauth2callback
For your domain: https://taxtracker.yourbusiness.com/oauth2callback


Click "Create"
A popup will show your Client ID and Client Secret - copy the Client ID for later

Part 3: Deploying Your Website (15-20 minutes)
Option A: Deploy with Netlify (Easiest)

Create a free account on Netlify
Download the ZIP file I've provided with the application code
Extract the ZIP file to a folder on your computer
Open the file src/config.js in a text editor (like Notepad)
Replace the values with your information:
jsexport const SPREADSHEET_ID = 'your-spreadsheet-id-here';
export const CLIENT_ID = 'your-client-id-here';

Save the file
In Netlify, click "Sites" > "Add new site" > "Deploy manually"
Drag and drop the entire folder (after editing the config file) to the upload area
Wait for deployment to complete (1-2 minutes)
Netlify will give you a random URL (like https://random-name-123456.netlify.app)
Click "Domain settings" to set up a custom domain if desired

Option B: Deploy with GitHub Pages
Instructions included in the ZIP file's README for this alternative option.
Using Your Tax Return Status Tracker
For You (The Tax Preparer)

Keep your Google Sheet updated as you work through returns
For each client:

Update their "status" when it changes
The position will be calculated automatically!
Update their "estimatedCompletion" date as needed


You can share the website URL with all your clients

For Your Clients

Clients visit your website URL
They enter their full name or email address
They instantly see their current status and estimated completion date

Understanding Automatic Position Calculation
This Tax Return Tracker features automatic position calculation in two ways:

In the Application: The app automatically calculates positions based on status priority:

"In Progress" clients come first
Followed by "Review"
Then "Awaiting Documents"
Then "In Queue"
Completed returns don't show a position number


In Google Sheets: You can optionally set up formula-based calculation in your spreadsheet too. See the AUTOMATIC_POSITIONS.md file for detailed instructions.

Troubleshooting

Website shows "Error loading data": Check that your Google Sheet is properly shared and the spreadsheet ID is correct
Search returns no results: Make sure the client is searching with information that exactly matches what's in your spreadsheet
Authentication errors: Ensure you've properly set up the Google Cloud OAuth consent screen

Need Help?
If you encounter any issues, please contact your developer for assistance.