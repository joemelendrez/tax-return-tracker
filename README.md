# Tax Return Status Tracker

A React-based web application that allows clients to check the status of their tax returns using Google Sheets as a data source. Built with serverless functions for secure API key management.

![Tax Return Status Tracker Screenshot](/public/Example.webp)

![Tax Return Google Sheet](/public/Sheet.webp)

## Overview

This application provides a simple, user-friendly interface for clients to check the status of their tax returns. It uses Google Sheets as a database with Netlify Functions for secure data access, automatic position calculation, and estimated completion dates.

### Key Features

- **Secure API Access**: API keys protected using Netlify Functions
- **Status Tracking**: Real-time status updates from Google Sheets
- **Automatic Position Calculation**: Determines queue position based on status priority
- **Estimated Completion Dates**: Calculates expected completion dates based on position
- **Mobile Responsive**: Works on all devices and screen sizes
- **Fallback System**: Uses demo data if Google Sheets connection fails
- **Search by Name or Email**: Supports both full name and email address lookup

## Demo

[Live Demo](https://trackexample.netlify.app) - Try searching with "John Smith" or "john@example.com"

## Setup Guide

### Prerequisites

- Google account
- Google Cloud Platform project
- Netlify account
- Node.js and npm
- Basic understanding of web hosting

### Step 1: Set Up Google Sheet

1. Create a new Google Sheet with the following columns (in this exact order):
   - **Column A**: `id` (unique identifier)
   - **Column B**: `name` (client's full name - First Last format)
   - **Column C**: `email` (client's email address)
   - **Column D**: `status` (current status)
   - **Column E**: `position` (optional manual position override)
   - **Column F**: `estimatedCompletion` (optional manual date override)

2. Fill the sheet with your client data, using these status values:
   - `In Progress` - Currently being processed
   - `Review` - Ready for final review
   - `Awaiting Documents` - Waiting for client documents
   - `In Queue` - Not yet started
   - `Completed` - Finished processing

3. Set sharing permissions:
   - Click "Share" in the top-right corner
   - Set to "Anyone with the link can view"
   - Copy the spreadsheet ID from the URL (the long string between `/d/` and `/edit`)

**Example data format:**
```
id  | name         | email              | status             | position | estimatedCompletion
001 | John Smith   | john@example.com   | In Progress        |          |
002 | Jane Doe     | jane@example.com   | Awaiting Documents |          | 5/25/2025
003 | Bob Johnson  | bob@example.com    | Completed          | 0        | 5/15/2025
```

### Step 2: Set Up Google Cloud API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API" and enable it
4. Create an API key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - **Important**: Restrict the key to Google Sheets API only
   - Copy the API key (keep it secure!)

### Step 3: Deploy to Netlify

1. **Fork or clone this repository**
   ```bash
   git clone https://github.com/joemelendrez/tax-return-tracker.git
   cd tax-return-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Connect to Netlify**
   - Push your code to GitHub
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `build`

4. **Configure Environment Variables** in Netlify:
   - Go to Site settings → Environment variables
   - Add these variables:
     - `GOOGLE_SHEETS_API_KEY`: Your Google Sheets API key
     - `SPREADSHEET_ID`: Your Google Sheet ID
     - `SHEET_NAME`: Your sheet name (usually "Sheet1")

5. **Deploy**
   - Netlify will automatically build and deploy your site
   - The Netlify Function will handle secure API calls

### Step 4: Customize Your Site

1. **Update site settings**:
   - Modify `public/index.html` for title, favicon, etc.
   - Update meta tags for SEO

2. **Customize styling** (optional):
   - Edit `src/styles.css` to match your brand colors
   - Update company information in the footer

3. **Adjust completion settings** (optional):
   - Modify `DAILY_COMPLETION_RATE` in `src/App.js`
   - Update `WORKING_DAYS` array for your schedule

### Step 5: Set Up Custom Domain (Optional)

1. In Netlify, go to Site settings → Domain management
2. Add your custom domain (e.g., track.yourfirm.com)
3. Follow DNS configuration instructions
4. SSL certificate will be automatically provisioned

## Usage Guide

### For Clients

1. Visit your application URL
2. Enter full name (exactly as in your system) or email address
3. Click "Check Status" to see current status and timeline

**Search Requirements:**
- Names must be entered as "First Last" (both first and last name)
- Email addresses must match exactly
- Search is case-insensitive

### For Administrators

**Updating client information:**
1. Edit your Google Sheet directly
2. Update status as returns move through your workflow
3. Optionally set manual positions or dates
4. Changes appear in the app immediately

**Status workflow:**
- Start returns as "In Queue"
- Move to "In Progress" when work begins
- Change to "Awaiting Documents" if client info is needed
- Move to "Review" when ready for final review
- Set to "Completed" when finished

## Technical Details

### Architecture

- **Frontend**: React application with responsive design
- **Backend**: Netlify Functions (serverless)
- **Data Source**: Google Sheets API
- **Hosting**: Netlify with automatic SSL

### Security Features

- ✅ API keys stored as environment variables
- ✅ No sensitive data exposed in client code
- ✅ HTTPS enforced on all communications
- ✅ CORS properly configured
- ✅ Only displays status info, not sensitive tax details

### Status Priority System

Returns are prioritized in this order:
1. **In Progress** (🔨) - Highest priority
2. **Review** (🔍) - Second priority  
3. **Awaiting Documents** (📝) - Third priority
4. **In Queue** (⏳) - Fourth priority
5. **Completed** (✅) - Lowest priority

### Automatic Calculations

**Position Calculation:**
- Based on status priority first
- Within same status, preserves spreadsheet order
- Manual position values override calculations

**Date Calculation:**
- Uses working days only (Mon-Fri by default)
- Based on position and daily completion rate
- Manual dates in spreadsheet override calculations

## Customization Options

### Completion Rate Settings

Modify in `src/App.js`:
```javascript
const DAILY_COMPLETION_RATE = 5; // Returns completed per day
const WORKING_DAYS = [1, 2, 3, 4, 5]; // Mon-Fri (1=Mon, 7=Sun)
```

### Adding Custom Statuses

1. Update `statusPriority` object in `calculatePositions` function
2. Add emoji in `getStatusEmoji` function
3. Update progress calculation in `getProgressPercentage`

### Styling Customization

- Colors and fonts: Edit CSS variables in `src/styles.css`
- Layout: Modify component structure in `src/App.js`
- Mobile responsiveness: Already included, adjust breakpoints as needed

## File Structure

```
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── App.js              # Main React component
│   ├── styles.css          # All styling
│   └── index.js            # React entry point
├── netlify/
│   └── functions/
│       └── get-tax-data.js  # Serverless function for secure API calls
├── package.json
└── README.md
```

## API Reference

### Netlify Function Endpoint

**URL**: `/.netlify/functions/get-tax-data`  
**Method**: GET  
**Response**: Processed client data from Google Sheets  
**Security**: API keys managed server-side

## Troubleshooting

### Common Issues

**"No record found" error:**
- Verify client name is exactly as shown in Google Sheet
- Check email address for typos
- Ensure name format is "First Last" (both names required)

**"Demo Mode" showing:**
- Check environment variables in Netlify
- Verify Google Sheets API key permissions  
- Ensure spreadsheet is publicly viewable
- Check spreadsheet ID is correct

**SSL/HTTPS issues:**
- Netlify automatically provides SSL
- Custom domains may take time to provision certificates
- Check domain configuration in Netlify

### Performance Optimization

For large datasets (100+ returns):
1. Consider implementing pagination
2. Monitor Netlify function execution times
3. Implement client-side caching if needed

## Support

### Getting Help

1. Check [Netlify documentation](https://docs.netlify.com/)
2. Review [Google Sheets API docs](https://developers.google.com/sheets)
3. Verify environment variables are set correctly
4. Check Netlify function logs for errors

### Feature Requests

This is an open-source project. Feel free to submit:
- Bug reports via GitHub issues
- Feature requests via GitHub discussions
- Pull requests for improvements

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Technologies Used

- **Frontend**: React 18, CSS3, HTML5
- **Backend**: Netlify Functions (Node.js)
- **API**: Google Sheets API
- **Hosting**: Netlify with CDN
- **Security**: Environment variables, HTTPS

---

**Built for efficient tax return tracking with security and simplicity in mind.**

## Credits

- Icons: Unicode emoji set
- Fonts: System fonts for optimal loading
- API: Google Sheets API for data management

---

### Quick Start Checklist

- [ ] Create Google Sheet with proper column structure
- [ ] Get Google Sheets API key from Google Cloud Console
- [ ] Fork/clone this repository
- [ ] Deploy to Netlify
- [ ] Set environment variables in Netlify
- [ ] Test with demo data
- [ ] Configure custom domain (optional)
- [ ] Update branding/styling (optional)

Need help? Check the troubleshooting section or open an issue on GitHub!
