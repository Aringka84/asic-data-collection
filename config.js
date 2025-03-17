module.exports = {
    // API Configuration
    apiUrl: "https://service.asic.gov.au/search/screenservices/Search/Detail/RepresentativeDetail/DataActionGetRepresentatives2",
    moduleVersion: "K0_5s+JkwQ03_hXIq9ZrvA",
    apiVersion: "KKz_qdIiOcKqTpmEkWMNsQ",
    
    // Request Headers
    requestHeaders: {
      "accept": "application/json",
      "accept-language": "en-GB,en;q=0.7",
      "cache-control": "no-cache",
      "content-type": "application/json; charset=UTF-8",
      "outsystems-locale": "en-AU",
      "pragma": "no-cache",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "referer": "https://service.asic.gov.au/search/RepresentativeDetail"
    },
    
    // Request Behavior
    requestIntervalMs: 3000,    // Time between requests in milliseconds (with jitter)
    retryFailedIds: true,       // Whether to retry failed IDs
    maxRetries: 3,              // Maximum number of retries per ID
    
    // Resume & Duplicate Handling
    resumeFromLastId: true,     // Resume from the highest ID in existing data
    updateExistingEntries: true, // Update existing entries instead of duplicating
    
    // ID Range (can be overridden via command line arguments)
    defaultStartId: 500000,
    defaultEndId: 505000,
    
    // Google Sheet Configuration
    spreadsheetId: "Enter-Spreadsheet-ID-HERE",  // The ID from your Google Sheet URL
    spreadsheetRange: "Sheet1!A1",              // Starting cell for appending data
    addHeaderRow: true,                         // Add a header row with field names
    
    // Service Account Configuration
    serviceAccountKeyPath: "./service-account-key.json", // Path to your service account key file
    
    // Output Options
    outputMode: "csv",        // Options: "csv", "sheets", or "both"
    backupCsvPath: "./representative_data.csv", // CSV file path
    
    // Fields to extract from the API response
    fieldsToExtract: [
      "repNumber",
      "repName",
      "entityType",
      "licenceName",
      "licenceNumber",
      "repPrincipalBusinessAddress",
      "repCommencedDt",
      "repCeasedDt",
      "repStatus",
      "repOrganisationNumber"
    ]
  };