exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Your API credentials from environment variables
  const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
  const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
  const SHEET_NAME = process.env.SHEET_NAME || 'Sheet1';
  const RANGE = process.env.RANGE || 'A2:F1000';

  // Check if required environment variables are set
  if (!API_KEY || !SPREADSHEET_ID) {
    console.error('Missing required environment variables');
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Server configuration error',
        details: 'Missing API credentials',
      }),
    };
  }

  try {
    // Build the Google Sheets API URL
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!${RANGE}?key=${API_KEY}`;

    console.log(`Fetching data from Google Sheets for ${SHEET_NAME}`);

    // Fetch data from Google Sheets
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Sheets API error:', response.status, errorText);

      // Return different errors based on status code
      if (response.status === 403) {
        throw new Error('API key invalid or quota exceeded');
      } else if (response.status === 404) {
        throw new Error('Spreadsheet not found');
      } else {
        throw new Error(`API error: ${response.status}`);
      }
    }

    const data = await response.json();

    // Log some basic info (don't log the actual data for privacy)
    console.log(
      `Successfully fetched data: ${data.values ? data.values.length : 0} rows`
    );

    // Return the data with proper CORS headers
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json',
        // Cache the response for
        'Cache-Control': 'max-age=30', // Cache for 1 hour
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Function error:', error.message);

    // Return a generic error response
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Failed to fetch data',
        message: error.message,
      }),
    };
  }
};
