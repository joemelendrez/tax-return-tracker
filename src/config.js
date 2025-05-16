// Tax Return Tracker Configuration
// Replace these values with your own Google API credentials

export const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Add your spreadsheet ID
export const CLIENT_ID = 'YOUR_GOOGLE_OAUTH_CLIENT_ID_HERE'; // Add your OAuth client ID
export const SHEET_NAME = 'Sheet1';  // Change if your sheet has a different name
export const RANGE = 'A2:F1000';     // The range to fetch (A2:F1000 gets all data except headers)

// Status priority for automatic position calculation (lower number = higher priority)
export const STATUS_PRIORITY = {
  'In Progress': 1,
  'Review': 2,
  'Awaiting Documents': 3,
  'In Queue': 4,
  'Completed': 5
};

// Advanced Settings (only change if you know what you're doing)
export const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';
export const REFRESH_INTERVAL = 300000; // Auto-refresh data every 5 minutes (300000 ms)