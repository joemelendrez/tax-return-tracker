import React, { useState, useEffect } from 'react';
import { 
  SPREADSHEET_ID, 
  CLIENT_ID, 
  SHEET_NAME, 
  RANGE, 
  SCOPES,
  REFRESH_INTERVAL 
} from './config';

const TaxReturnTracker = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [returnData, setReturnData] = useState([]);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Initialize Google API client
  useEffect(() => {
    // Show loading message while initializing
    console.log('Initializing Google API client...');
    
    // Load the Google API client library
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      window.gapi.load('client:auth2', initClient);
    };
    script.onerror = () => {
      console.error('Failed to load Google API client');
      setError('Unable to load Google API. Please check your internet connection and try again.');
      setIsInitializing(false);
      setIsLoading(false);
      // Load mock data as fallback
      loadMockData();
    };
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  
  // Initialize the Google API client
  const initClient = () => {
    window.gapi.client.init({
      clientId: CLIENT_ID,
      scope: SCOPES,
      discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
    }).then(() => {
      console.log('Google API client initialized');
      // Listen for sign-in state changes
      window.gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
      
      // Handle the initial sign-in state
      updateSigninStatus(window.gapi.auth2.getAuthInstance().isSignedIn.get());
      setIsInitializing(false);
    }).catch(error => {
      console.error('Error initializing Google API client:', error);
      setError('Unable to initialize Google authentication. Please check your configuration and try again.');
      setIsInitializing(false);
      setIsLoading(false);
      
      // Load mock data as fallback
      loadMockData();
    });
  };
  
  // Update authentication status and load data if authenticated
  const updateSigninStatus = (isSignedIn) => {
    console.log('Auth status updated:', isSignedIn ? 'Signed in' : 'Signed out');
    setIsAuthenticated(isSignedIn);
    
    if (isSignedIn) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  };
  
  // Handle sign-in button click
  const handleAuthClick = () => {
    if (window.gapi && window.gapi.auth2) {
      if (!window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
        window.gapi.auth2.getAuthInstance().signIn();
      }
    } else {
      setError('Google authentication is not initialized. Please refresh the page and try again.');
    }
  };
  
  // Load mock data for development/fallback
  const loadMockData = () => {
    console.log('Loading mock data as fallback');
    const mockData = [
      { id: '001', name: 'John Smith', email: 'john@example.com', status: 'Completed', position: 1, estimatedCompletion: '5/10/2025' },
      { id: '002', name: 'Jane Doe', email: 'jane@example.com', status: 'In Progress', position: 5, estimatedCompletion: '5/17/2025' },
      { id: '003', name: 'Robert Johnson', email: 'robert@example.com', status: 'In Queue', position: 25, estimatedCompletion: '5/25/2025' },
      { id: '004', name: 'Sarah Williams', email: 'sarah@example.com', status: 'Awaiting Documents', position: 15, estimatedCompletion: '5/20/2025' },
      { id: '005', name: 'Michael Brown', email: 'michael@example.com', status: 'In Queue', position: 32, estimatedCompletion: '5/28/2025' },
    ];
    setReturnData(mockData);
    
    const now = new Date();
    setLastUpdated(now.toLocaleString() + ' (DEMO DATA)');
  };

  // Fetch data from Google Sheets
  const fetchData = async () => {
    console.log('Fetching data from Google Sheets...');
    setIsLoading(true);
    
    try {
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!${RANGE}`
      });
      
      console.log('Data received from Google Sheets');
      
      // Transform the data from rows to objects
      const rows = response.result.values || [];
      const formattedData = rows.map(row => ({
        id: row[0] || '',
        name: row[1] || '',
        email: row[2] || '',
        status: row[3] || '',
        position: parseInt(row[4], 10) || 999,
        estimatedCompletion: row[5] || ''
      })).filter(item => item.id && item.name); // Filter out any empty rows
      
      // Calculate positions based on status
      const calculatedPositions = calculatePositions(formattedData);
      
      setReturnData(calculatedPositions);
      
      // Update the last updated timestamp
      const now = new Date();
      setLastUpdated(now.toLocaleString());
      
      // If we already found a client, update their info
      if (statusMessage && statusMessage.id) {
        const updatedClient = calculatedPositions.find(client => 
          client.id === statusMessage.id
        );
        
        if (updatedClient) {
          setStatusMessage(updatedClient);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Unable to load data from Google Sheets. Please check your configuration and try again.');
      
      // Only load mock data if we don't already have data
      if (returnData.length === 0) {
        loadMockData();
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate positions based on status
  const calculatePositions = (clients) => {
    // First, sort by any existing position values as a starting point
    const sortedClients = [...clients].sort((a, b) => a.position - b.position);
    
    // Define status priority (lower number = higher priority)
    const statusPriority = {
      'In Progress': 1,
      'Review': 2,
      'Awaiting Documents': 3,
      'In Queue': 4,
      'Completed': 5
    };
    
    // Group clients by status
    const clientsByStatus = {
      'In Progress': [],
      'Review': [],
      'Awaiting Documents': [],
      'In Queue': [],
      'Completed': []
    };
    
    // Place each client in their status group
    sortedClients.forEach(client => {
      const status = client.status || 'In Queue';
      if (clientsByStatus[status]) {
        clientsByStatus[status].push(client);
      } else {
        // If status doesn't match our defined statuses, put in In Queue
        clientsByStatus['In Queue'].push({...client, status: 'In Queue'});
      }
    });
    
    // Reassign positions based on status groups
    let position = 1;
    let result = [];
    
    // Process clients in priority order
    Object.keys(statusPriority).sort((a, b) => statusPriority[a] - statusPriority[b]).forEach(status => {
      // Skip completed items for position counting
      if (status === 'Completed') {
        // Add completed items with position 0 (or keep their original position if desired)
        clientsByStatus[status].forEach(client => {
          result.push({...client, calculatedPosition: 0});
        });
      } else {
        // For other statuses, assign incrementing positions
        clientsByStatus[status].forEach(client => {
          result.push({...client, calculatedPosition: position});
          position++;
        });
      }
    });
    
    // Return the result with both original position and calculated position
    return result;
  };
  
  // Set up automatic refresh
  useEffect(() => {
    if (isAuthenticated) {
      // Set up automatic refresh interval
      console.log(`Setting up auto-refresh every ${REFRESH_INTERVAL/1000} seconds`);
      const refreshInterval = setInterval(fetchData, REFRESH_INTERVAL);
      
      // Clean up the interval when component unmounts
      return () => clearInterval(refreshInterval);
    }
  }, [isAuthenticated]);
  
  const handleSearch = () => {
    setError('');
    
    if (!searchTerm.trim()) {
      setError('Please enter a name or email address.');
      return;
    }
    
    console.log(`Searching for: ${searchTerm}`);
    setIsLoading(true);
    
    // Simulate a small delay to mimic loading
    setTimeout(() => {
      const searchLower = searchTerm.toLowerCase().trim();
      
      // Search by name or email only (not by ID for security)
      const foundClient = returnData.find(client => 
        (client.name && client.name.toLowerCase().includes(searchLower)) ||
        (client.email && client.email.toLowerCase() === searchLower)
      );
      
      if (foundClient) {
        console.log('Client found:', foundClient);
        setStatusMessage(foundClient);
      } else {
        console.log('No client found for search term:', searchTerm);
        setError('No record found. Please check your information and try again.');
        setStatusMessage('');
      }
      
      setIsLoading(false);
    }, 800);
  };
  
  const getStatusEmoji = (status) => {
    switch(status) {
      case 'Completed': return '✅';
      case 'In Progress': return '🔨';
      case 'Review': return '🔍';
      case 'In Queue': return '⏳';
      case 'Awaiting Documents': return '📝';
      default: return '❓';
    }
  };
  
  const getProgressPercentage = (status, position, calculatedPosition) => {
    if (status === 'Completed') return 100;
    if (status === 'Review') return 80;
    if (status === 'In Progress') return 60;
    if (status === 'Awaiting Documents') return 30;
    
    // For In Queue, calculate based on position
    // Use calculatedPosition if available, otherwise fall back to original position
    const queuePosition = calculatedPosition || position;
    const maxPosition = 100;  // Adjust based on your needs
    const completionPercentage = Math.max(0, Math.min(20, (1 - queuePosition/maxPosition) * 20));
    return completionPercentage;
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-gray-50 min-h-screen">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Tax Return Status Tracker</h1>
          <p className="text-gray-600 mb-4">Initializing application...</p>
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-50 min-h-screen">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Tax Return Status Tracker</h1>
        
        {!isAuthenticated ? (
          <div className="text-center mb-6">
            <p className="mb-4 text-gray-600">Please sign in to access the tax return status tracker.</p>
            <button 
              onClick={handleAuthClick}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-300"
            >
              Sign in with Google
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="mb-4">
                <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">
                  Look up your return status
                </label>
                <input
                  type="text"
                  id="searchTerm"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name or email address"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Example: "John Smith" or "john@example.com"
                </p>
              </div>
              
              <button
                onClick={handleSearch}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Searching...
                  </>
                ) : 'Check Status'}
              </button>
            </div>
            
            {error && (
              <div className="p-4 mb-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                <p>{error}</p>
              </div>
            )}
            
            {statusMessage && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-2">{getStatusEmoji(statusMessage.status)}</span>
                  <h2 className="text-xl font-semibold text-gray-800">{statusMessage.name}</h2>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="font-semibold text-gray-800">{statusMessage.status}</p>
                  </div>
                  
                  {statusMessage.status !== 'Completed' && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Position in Queue</p>
                      <p className="font-semibold text-gray-800">#{statusMessage.calculatedPosition || statusMessage.position}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Estimated Completion</p>
                    <p className="font-semibold text-gray-800">{statusMessage.estimatedCompletion}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Progress</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${getProgressPercentage(statusMessage.status, statusMessage.position, statusMessage.calculatedPosition)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>Received</span>
                      <span>In Progress</span>
                      <span>Completed</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Use this tracker to check your tax return status.</p>
          {lastUpdated && <p className="mt-2">Last updated: {lastUpdated}</p>}
        </div>
      </div>
    </div>
  );
};

export default TaxReturnTracker;