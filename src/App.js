import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './styles.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [returnData, setReturnData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [isUsingMockData, setIsUsingMockData] = useState(true);

  // Completion rate settings
  const DAILY_COMPLETION_RATE = 5; // Number of returns you can complete per day

  // Memoize arrays using useMemo to prevent recreating on every render
  const WORKING_DAYS = useMemo(() => [1, 2, 3, 4, 5], []); // 1 = Monday, 7 = Sunday (Weekend excluded by default)

  // Sample data as fallback - wrapped in useMemo
  const mockData = useMemo(
    () => [
      {
        id: '001',
        name: 'John Smith',
        email: 'john.smith@example.com',
        status: 'In Progress',
        position: null,
        estimatedCompletion: '5/20/2025',
      },
      {
        id: '002',
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        status: 'In Queue',
        position: null,
        estimatedCompletion: '6/5/2025',
      },
      {
        id: '003',
        name: 'Michael Davis',
        email: 'mdavis@example.com',
        status: 'Review',
        position: null,
        estimatedCompletion: '5/18/2025',
      },
      {
        id: '004',
        name: 'Jennifer Williams',
        email: 'jwilliams@example.com',
        status: 'Awaiting Documents',
        position: null,
        estimatedCompletion: '5/25/2025',
      },
      {
        id: '005',
        name: 'Robert Garcia',
        email: 'robert.g@example.com',
        status: 'Completed',
        position: 0,
        estimatedCompletion: '5/12/2025',
      },
    ],
    []
  );

  // Calculate estimated completion date based on position
  const calculateEstimatedCompletionDate = useCallback(
    (position) => {
      // Start with today's date
      const today = new Date();
      const result = new Date(today);

      // Calculate how many days it will take to reach this position
      let daysNeeded = Math.ceil(position / DAILY_COMPLETION_RATE);

      // Account for working days only
      let daysAdded = 0;
      while (daysAdded < daysNeeded) {
        result.setDate(result.getDate() + 1);

        // Check if this is a working day (1-7, where 1 is Monday)
        const dayOfWeek = result.getDay() === 0 ? 7 : result.getDay();
        if (WORKING_DAYS.includes(dayOfWeek)) {
          daysAdded++;
        }
      }

      // Format date as MM/DD/YYYY
      return `${
        result.getMonth() + 1
      }/${result.getDate()}/${result.getFullYear()}`;
    },
    [DAILY_COMPLETION_RATE, WORKING_DAYS]
  );

  // Fixed calculatePositions function
  const calculatePositions = useCallback((clients) => {
    // Define status priority (lower number = higher priority)
    const statusPriority = {
      'In Progress': 1,
      Review: 2,
      'Awaiting Documents': 3,
      'In Queue': 4,
      Completed: 5,
    };

    // Separate clients with manual positions from those without
    const clientsWithManualPos = [];
    const clientsWithoutManualPos = [];

    clients.forEach((client, originalIndex) => {
      if (
        client.position !== null &&
        client.position !== undefined &&
        !isNaN(client.position)
      ) {
        clientsWithManualPos.push({ ...client, originalIndex });
      } else {
        clientsWithoutManualPos.push({ ...client, originalIndex });
      }
    });

    // Sort clients WITHOUT manual positions by status priority, then sheet order
    const sortedWithoutManual = clientsWithoutManualPos.sort((a, b) => {
      const statusA = a.status || 'In Queue';
      const statusB = b.status || 'In Queue';
      const priorityA = statusPriority[statusA] || 999;
      const priorityB = statusPriority[statusB] || 999;

      if (priorityA === priorityB) {
        // Same status - maintain original sheet order
        return a.originalIndex - b.originalIndex;
      }
      return priorityA - priorityB;
    });

    // Sort clients WITH manual positions by their manual position value
    const sortedWithManual = clientsWithManualPos.sort((a, b) => {
      return a.position - b.position;
    });

    // Assign calculated positions to clients without manual positions
    let autoPosition = 1;
    const withCalculatedPositions = sortedWithoutManual.map((client) => {
      if (client.status === 'Completed') {
        return { ...client, calculatedPosition: 0 };
      } else {
        return { ...client, calculatedPosition: autoPosition++ };
      }
    });

    // For clients with manual positions, use their manual position as calculated position
    const withManualPositions = sortedWithManual.map((client) => {
      if (client.status === 'Completed') {
        return { ...client, calculatedPosition: 0 };
      } else {
        return { ...client, calculatedPosition: client.position };
      }
    });

    // Combine both arrays - clients with manual positions keep their positions,
    // clients without get auto-calculated positions
    const allClients = [...withCalculatedPositions, ...withManualPositions];

    // Final sort by calculated position for display purposes
    const finalSorted = allClients.sort((a, b) => {
      const statusA = a.status || 'In Queue';
      const statusB = b.status || 'In Queue';
      const priorityA = statusPriority[statusA] || 999;
      const priorityB = statusPriority[statusB] || 999;

      // First by status priority
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Then by calculated position within same status
      return a.calculatedPosition - b.calculatedPosition;
    });

    console.log('🔍 Final position assignments:');
    finalSorted.forEach((client) => {
      const positionSource =
        client.position !== null && client.position !== undefined
          ? 'manual'
          : 'auto';
      console.log(
        `${client.calculatedPosition}. ${client.name} - Status: "${client.status}" (${positionSource})`
      );
    });

    return finalSorted;
  }, []);

  // Load data from Netlify Function
  const fetchData = useCallback(async () => {
    setIsLoading(true);

    try {
      // Call your Netlify function instead of Google Sheets directly
      const response = await fetch('/.netlify/functions/get-tax-data');

      if (!response.ok) {
        throw new Error('Failed to fetch data from API');
      }

      const result = await response.json();

      // Transform the data from rows to objects (same logic as before)
      if (result.values && result.values.length > 0) {
        const formattedData = result.values
          .map((row) => {
            const parsedPosition =
              row[4] && row[4].trim() !== '' ? parseInt(row[4], 10) : null;

            return {
  id: row[0] ? row[0].toString().trim() : '',
  name: row[1] ? row[1].toString().trim() : '', // TRIM THE NAME
  email: row[2] ? row[2].toString().trim() : '', // TRIM THE EMAIL
  status: row[3] ? row[3].toString().trim() : '',
  position: !isNaN(parsedPosition) ? parsedPosition : null,
  estimatedCompletion: row[5] ? row[5].toString().trim() : '',
};
          })
          .filter((item) => item.id && item.name);

        // Sort the data by status and position
        const calculatedPositions = calculatePositions(formattedData);

        const withEstimatedDates = calculatedPositions.map((client) => {
          const calculatedDate = calculateEstimatedCompletionDate(
            client.calculatedPosition
          );

          if (client.status === 'Completed' || client.estimatedCompletion) {
            return {
              ...client,
              calculatedEstimatedCompletion: calculatedDate,
            };
          } else {
            return {
              ...client,
              calculatedEstimatedCompletion: calculatedDate,
            };
          }
        });

        setReturnData(withEstimatedDates);

        const now = new Date();
        setLastUpdated(now.toLocaleString());
        setIsUsingMockData(false);
        return;
      }

      // Fallback to mock data
      throw new Error('Using mock data');
    } catch (err) {
      console.log('Using mock data:', err.message);
      // Use your existing mock data logic
      const calculatedPositions = calculatePositions(mockData);

      const withEstimatedDates = calculatedPositions.map((client) => {
        if (client.status === 'Completed') {
          return client;
        } else {
          return {
            ...client,
            calculatedEstimatedCompletion: calculateEstimatedCompletionDate(
              client.calculatedPosition
            ),
          };
        }
      });

      setReturnData(withEstimatedDates);

      const now = new Date();
      setLastUpdated(now.toLocaleString() + ' (DEMO DATA)');
      setIsUsingMockData(true);
    } finally {
      setIsLoading(false);
    }
  }, [calculatePositions, calculateEstimatedCompletionDate, mockData]);

  // Initial data load and local storage retrieval
  useEffect(() => {
    // Load the search term from local storage if available
    const savedSearchTerm = localStorage.getItem('taxTrackerSearchTerm');
    if (savedSearchTerm) {
      setSearchTerm(savedSearchTerm);
    }

    // Initial data fetch
    fetchData();
  }, [fetchData]);

  // Helper function for finding position display
  const getPositionDisplay = (client) => {
    // First priority: Check for an explicit position in the Google Sheet
    if (
      client.position !== null &&
      client.position !== undefined &&
      !isNaN(client.position)
    ) {
      return `#${client.position}`;
    }

    // Second priority: Use the calculated position
    if (
      client.calculatedPosition !== null &&
      client.calculatedPosition !== undefined
    ) {
      return `#${client.calculatedPosition}`;
    }

    // If somehow both are missing, show a default (should never happen)
    return 'In Process';
  };

  // Function to scroll to specific point within the results container
  const scrollToResultsHalfway = (behavior = 'smooth') => {
    // If we have results or an error to show, scroll to it
    const elementToScrollTo =
      document.querySelector('.result-container') ||
      document.querySelector('.error-container');

    if (elementToScrollTo) {
      // Calculate the element's position
      const rect = elementToScrollTo.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      // Get the element's height
      const elementHeight = rect.height;

      // Calculate position to scroll to - element's top position plus half of its height
      // This will scroll to a point halfway through the results container
      const halfwayPoint = rect.top + scrollTop + elementHeight / 2;

      // Calculate the viewport height
      const viewportHeight = window.innerHeight;

      // Calculate the final scroll position to place the halfway point in the middle of the viewport
      let scrollToY = halfwayPoint - viewportHeight / 2;

      // Ensure we don't scroll too far up (above the top of the page)
      scrollToY = Math.max(0, scrollToY);

      // Perform the smooth scroll
      window.scrollTo({
        top: scrollToY,
        behavior: behavior,
      });
    }
  };

  const handleSearch = () => {
    setError('');

    if (!searchTerm.trim()) {
      setError('Please enter a name or email address.');
      // Add short timeout to allow error to render before scrolling
      setTimeout(() => scrollToResultsHalfway(), 100);
      return;
    }

    // Check if this is an email search
    const isEmailSearch = searchTerm.includes('@');

    // If not an email, check if there's both first and last name
    if (!isEmailSearch) {
      const nameParts = searchTerm.trim().split(' ');
      if (nameParts.length < 2) {
        setError('Please enter both first and last name (e.g., "John Smith").');
        // Add short timeout to allow error to render before scrolling
        setTimeout(() => scrollToResultsHalfway(), 100);
        return;
      }
    }
    // Save search term to local storage
    localStorage.setItem('taxTrackerSearchTerm', searchTerm);

    setIsLoading(true);

    // First refresh data from API
    fetchData()
      .then(() => {
        // After data is refreshed, search using the latest data
        setTimeout(() => {
          const searchLower = searchTerm.toLowerCase().trim();

          // For email: exact match, For name: exact full name match (case insensitive)
          const foundClient = returnData.find((client) => {
            if (isEmailSearch) {
              // Email search - exact match
              return client.email && client.email.toLowerCase() === searchLower;
            } else {
              // Name search - must match full name exactly (but case insensitive)
              return client.name && client.name.toLowerCase() === searchLower;
            }
          });

          if (foundClient) {
            setStatusMessage(foundClient);
          } else {
            setError(
              'No record found. Please check your information and try again.'
            );
            setStatusMessage(null);
          }

          setIsLoading(false);

          // Add a slight delay to allow DOM to update before scrolling
          setTimeout(() => scrollToResultsHalfway(), 100);
        }, 300);
      })
      .catch((err) => {
        console.error('Error during search:', err);

        // If there's an error refreshing, still try to search with existing data
        const searchLower = searchTerm.toLowerCase().trim();
        const isEmailSearch = searchTerm.includes('@');

        const foundClient = returnData.find((client) => {
          if (isEmailSearch) {
            // Email search - exact match
            return client.email && client.email.toLowerCase() === searchLower;
          } else {
            // Name search - must match full name exactly (but case insensitive)
            return client.name && client.name.toLowerCase() === searchLower;
          }
        });

        if (foundClient) {
          setStatusMessage(foundClient);
        } else {
          setError(
            'No record found. Please check your information and try again.'
          );
          setStatusMessage(null);
        }

        setIsLoading(false);

        // Add a slight delay to allow DOM to update before scrolling
        setTimeout(() => scrollToResultsHalfway(), 100);
      });
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'Completed':
        return '✅';
      case 'In Progress':
        return '🔨';
      case 'Review':
        return '🔍';
      case 'In Queue':
        return '⏳';
      case 'Awaiting Documents':
        return '📝';
      default:
        return '❓';
    }
  };

  // Helper function for progress percentage
  const getProgressPercentage = (status, position, calculatedPosition) => {
    if (status === 'Completed') return 100;
    if (status === 'Review') return 80;
    if (status === 'In Progress') return 60;
    if (status === 'Awaiting Documents') return 30;

    // For In Queue, calculate based on position
    const queuePosition = calculatedPosition || position;
    const maxPosition = 100; // Adjust based on your needs
    const completionPercentage = Math.max(
      0,
      Math.min(20, (1 - queuePosition / maxPosition) * 20)
    );
    return completionPercentage;
  };

  // Handle key press (Enter to search)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Tax Return Status Tracker</h1>

      <div className="search-container">
        <label className="search-label">Look up your return status</label>
        <input
          type="text"
          className="search-input"
          placeholder="Enter your full name (First Last) or email address"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <p className="search-example">
          Example: "John Smith" or "john@example.com"
        </p>

        <button
          onClick={handleSearch}
          className="search-button"
          disabled={isLoading}
        >
          {isLoading ? 'Searching...' : 'Check Status'}
        </button>
      </div>

      {error && (
        <div className="error-container">
          <p>{error}</p>
        </div>
      )}

      {statusMessage && (
        <div className="result-container">
          <div className="result-header">
            <span className="result-emoji">
              {getStatusEmoji(statusMessage.status)}
            </span>
            <h2 className="result-name">{statusMessage.name}</h2>
          </div>

          <div>
            <div className="result-section">
              <p className="result-label">Status</p>
              <p className="result-value">{statusMessage.status}</p>
            </div>

            {statusMessage.status !== 'Completed' && (
              <div className="result-section">
                <p className="result-label">Position in Queue</p>
                <p className="result-value">
                  {getPositionDisplay(statusMessage)}
                </p>
              </div>
            )}

            {/* Only show completion date for certain statuses - exclude In Queue AND Completed */}
            {statusMessage.status !== 'In Queue' &&
              statusMessage.status !== 'Completed' && (
                <div className="result-section">
                  <p className="result-label">
                    {statusMessage.status === 'Awaiting Documents'
                      ? 'Timeline'
                      : 'Estimated Completion'}
                  </p>
                  <p
                    className={`result-value ${
                      statusMessage.status === 'Awaiting Documents'
                        ? 'awaiting-docs'
                        : ''
                    }`}
                  >
                    {/* Special handling for Awaiting Documents status */}
                    {statusMessage.status === 'Awaiting Documents'
                      ? statusMessage.estimatedCompletion ||
                        'Pending document receipt'
                      : statusMessage.estimatedCompletion ||
                        statusMessage.calculatedEstimatedCompletion}
                  </p>
                  {statusMessage.status === 'Awaiting Documents' && (
                    <p className="result-note">
                      Your return will be processed within 5 business days after
                      we receive your documents.
                    </p>
                  )}
                </div>
              )}

            <div className="progress-container">
              <p className="result-label">Progress</p>
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{
                    width: `${getProgressPercentage(
                      statusMessage.status,
                      statusMessage.position,
                      statusMessage.calculatedPosition
                    )}%`,
                  }}
                ></div>
              </div>
              <div className="progress-labels">
                <span>Received</span>
                <span>In Progress</span>
                <span>Completed</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="footer-container">
        <p>Use this tracker to check your tax return status.</p>
        {lastUpdated && (
          <p className="last-updated">Last updated: {lastUpdated}</p>
        )}
        {isUsingMockData && (
          <p className="demo-mode">Demo Mode - Using Sample Data</p>
        )}
      </div>
    </div>
  );
}

export default App;