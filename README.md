# Tax Return Status Tracker

A web application that allows clients to check the status of their tax returns using Google Sheets as a data source.

![Tax Return Status Tracker Screenshot](https://placeholder.com/tax-tracker-screenshot.png)

## Overview

This application provides a simple, user-friendly interface for clients to check the status of their tax returns. It uses Google Sheets as a database, with automatic position calculation and estimated completion dates.

### Key Features

- **Status Tracking**: Real-time status updates from Google Sheets
- **Automatic Position Calculation**: Determines queue position based on status priority
- **Estimated Completion Dates**: Calculates expected completion dates based on position
- **Mobile Responsive**: Works on all devices and screen sizes
- **Fallback System**: Uses demo data if Google Sheets connection fails

## Setup Guide

### Prerequisites

- Google account
- Google Cloud Platform project
- Basic understanding of web hosting

### Step 1: Set Up Google Sheet

1. Create a new Google Sheet with the following columns:
   - A: id (unique identifier)
   - B: name (client's full name)
   - C: email (client's email address)
   - D: status (current status)
   - E: position (optional manual position override)
   - F: estimatedCompletion (optional manual date override)

2. Fill the sheet with your client data, using these status values:
   - "In Progress"
   - "Review"
   - "Awaiting Documents"
   - "In Queue"
   - "Completed"

3. Set sharing permissions:
   - Click "Share" in the top-right corner
   - Set to "Anyone with the link can view"
   - Copy the spreadsheet ID from the URL (the long string between /d/ and /edit)

### Step 2: Set Up Google Cloud API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API" and enable it
4. Create an API key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Restrict the key to Google Sheets API only
   - Copy the API key

### Step 3: Configure the Application

1. Open `src/App.js`
2. Replace the placeholder values:
   ```javascript
   const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your API key
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Replace with your spreadsheet ID
   const SHEET_NAME = 'Sheet1'; // Change if your sheet has a different name
   ```
3. Adjust the daily completion rate if needed:
   ```javascript
   const DAILY_COMPLETION_RATE = 5; // Number of returns you can complete per day
   ```

### Step 4: Customize HTML/CSS (Optional)

1. Update `index.html` with your company logo and information
2. Modify `styles.css` to match your brand colors and styling preferences

### Step 5: Deploy the Application

1. Build the production version:
   ```
   npm run build
   ```
2. Deploy to your preferred hosting service:
   - GitHub Pages
   - Netlify
   - Vercel
   - Or any other static site hosting

## Usage Guide

### For Clients

Clients simply need to:
1. Visit the application URL
2. Enter their full name (exactly as it appears in your system) or email address
3. Click "Check Status" to see their current status and timeline

### For Administrators

To update client information:

1. Edit the Google Sheet directly:
   - Update status as tax returns move through your workflow
   - Optionally override positions or estimated dates
   - Add new clients as needed

2. The application will automatically:
   - Calculate queue positions based on status
   - Determine estimated completion dates
   - Display special messaging for "Awaiting Documents" status

## Technical Details

### Status Priority System

Returns are prioritized in this order:
1. In Progress (highest priority)
2. Review
3. Awaiting Documents
4. In Queue
5. Completed (lowest priority)

### Position Calculation

- Positions are calculated based on status priority first
- Within the same status, the original order in the spreadsheet is preserved
- Manual position values in the spreadsheet override calculated positions

### Date Calculation

- Estimated completion dates account for working days only
- The calculation is based on position and daily completion rate
- Manual dates in the spreadsheet override calculated dates

## Troubleshooting

### Common Issues

1. **"No record found" error**:
   - Ensure clients are using their exact full name or email address
   - Check for typos or case sensitivity issues
   - Verify the client exists in the Google Sheet

2. **Demo Mode Active**:
   - Check Google Sheets API key and permissions
   - Verify spreadsheet ID is correct
   - Ensure sharing settings are set to "Anyone with the link can view"

3. **Incorrect Positions or Dates**:
   - Check the status values in your Google Sheet (case sensitive)
   - Verify the daily completion rate matches your actual pace
   - Check for manual overrides in the position/date columns

## Advanced Customization

### Changing Working Days

Modify the `WORKING_DAYS` array to match your work schedule:
```javascript
const WORKING_DAYS = useMemo(() => [1, 2, 3, 4, 5], []); // 1 = Monday, 7 = Sunday
```

For example, to include Saturdays:
```javascript
const WORKING_DAYS = useMemo(() => [1, 2, 3, 4, 5, 6], []);
```

### Adding Custom Statuses

1. Update the `getStatusEmoji` function with your new status
2. Add your new status to the `statusPriority` object in `calculatePositions`
3. Update the progress percentage calculation in `getProgressPercentage`

### Styling Customization

The application uses a clean, minimalist design that can be easily customized:
- Color scheme is defined with CSS variables in `styles.css`
- Layout is responsive and adapts to all screen sizes
- Components are styled individually for easy modification

## Security Considerations

- The application only displays status information, not sensitive tax details
- Google Sheets API key should be restricted to Sheets API only
- Consider implementing additional authentication for high-security needs

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with React
- Uses Google Sheets API for data storage
- Icons and emojis from standard Unicode character set

---

# Administrator's Guide

## Google Sheet Management

### Setting Up the Sheet

Your Google Sheet should have the following structure:

| Column | Header | Description |
|--------|--------|-------------|
| A | id | Unique identifier for each client |
| B | name | Client's full name (First Last format) |
| C | email | Client's email address |
| D | status | Current status of the tax return |
| E | position | (Optional) Manual position override |
| F | estimatedCompletion | (Optional) Manual completion date |

### Status Values

The application recognizes these status values:

| Status | Description | Visual Indicator | Priority |
|--------|-------------|------------------|----------|
| In Progress | Currently being processed | 🔨 | 1 (Highest) |
| Review | Ready for final review | 🔍 | 2 |
| Awaiting Documents | Waiting for client documents | 📝 | 3 |
| In Queue | Not yet started | ⏳ | 4 |
| Completed | Finished processing | ✅ | 5 (Lowest) |

### Tips for Managing the Sheet

1. **Batch Updates**: Make changes to multiple returns at once to improve efficiency
2. **Filter by Status**: Use Google Sheets filters to view returns by status
3. **Manual Overrides**: Use columns E and F to override automatic calculations when needed
4. **Comments**: Use Google Sheets comments for internal notes about returns
5. **Data Validation**: Consider adding data validation to ensure status values are consistent

## Application Maintenance

### Updating the Configuration

The main configuration values are in `src/App.js`:

```javascript
const API_KEY = 'YOUR_API_KEY_HERE';
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'Sheet1';
const RANGE = 'A2:F1000';
const DAILY_COMPLETION_RATE = 5;
```

To modify these:
1. Edit the values in the file
2. Rebuild the application
3. Deploy the updated version

### Regular Maintenance Tasks

1. **Monitor API Usage**: Check Google Cloud Console for API usage and limits
2. **Update Completion Rate**: Adjust based on your current workload and capacity
3. **Check for API Updates**: Google may update their API, requiring changes
4. **Back Up Data**: Regularly back up your Google Sheet
5. **Test Search Functionality**: Periodically verify search works with different names/emails

### Performance Optimization

If you have a large number of tax returns:
1. Consider limiting the range of data fetched (e.g., change `A2:F1000` to a smaller range)
2. Implement pagination if you have more than a few hundred returns
3. Monitor load times and user experience with larger datasets

## Customization Guide

### Adding Company Branding

1. **Logo**: Replace the placeholder logo in the header and footer
2. **Colors**: Update the CSS color variables to match your brand
3. **Fonts**: Change the font family if desired
4. **Text**: Customize the text in the header, footer, and application

### Modifying the Search Experience

The default search requires an exact match for email or full name. To modify this:

1. For more flexible name matching:
```javascript
// Find this section in handleSearch
const foundClient = returnData.find((client) => {
  if (isEmailSearch) {
    return client.email && client.email.toLowerCase() === searchLower;
  } else {
    // Change this line for more flexible name matching
    return client.name && client.name.toLowerCase().includes(searchLower);
  }
});
```

2. For additional search fields, update both the search logic and the Google Sheet structure.

### Advanced Customization Options

1. **Integration with Other Systems**: The application can be modified to pull data from other sources
2. **Additional Data Display**: Show more information from your Google Sheet
3. **Analytics Integration**: Add tracking to understand user behavior
4. **Automated Notifications**: Implement email notifications for status changes

## Support and Troubleshooting

### Common Technical Issues

1. **API Key Errors**: 
   - Verify API key has correct permissions
   - Check for character/spacing issues in configuration

2. **CORS Issues**:
   - Ensure proper CORS settings if using custom domain

3. **Rate Limiting**:
   - Google Sheets API has usage limits
   - Consider implementing caching for high-traffic sites

### Performance Issues

1. **Slow Loading**:
   - Reduce the amount of data fetched
   - Implement loading optimizations

2. **Data Not Refreshing**:
   - Check the refresh interval setting
   - Verify Google Sheets API access

### Getting Help

For technical assistance:
1. Review Google Sheets API documentation
2. Check React documentation for UI issues
3. Consult with a web developer for custom modifications