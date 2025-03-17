const fs = require('fs');
const fetch = require('node-fetch');
const { google } = require('googleapis');

// Load configuration
const config = require('./config.js');

// Command line arguments
const args = process.argv.slice(2);
let startId = config.defaultStartId;
let endId = config.defaultEndId;

// Override with command line arguments if provided
if (args.length >= 2) {
  startId = parseInt(args[0]);
  endId = parseInt(args[1]);
}

console.log(`Starting fetch process for IDs from ${startId} to ${endId}`);

// Initialize tracking variables
const failedIds = [];
let currentId = startId;
let successful = 0;

// Google Sheets authentication setup
async function setupGoogleSheets() {
  try {
    // Load service account credentials from the file
    const credentials = require(config.serviceAccountKeyPath);
    
    // Create a JWT client using the service account credentials
    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    
    // Create and return the Google Sheets API client
    const sheets = google.sheets({ version: 'v4', auth });
    return sheets;
  } catch (error) {
    console.error(`Error setting up Google Sheets: ${error.message}`);
    throw error;
  }
}

// Extract data based on configured fields
function extractDataFromResponse(response) {
  if (!response.data || 
      !response.data.GetRepresentativesAPIResponse || 
      !response.data.GetRepresentativesAPIResponse.Representatives || 
      !response.data.GetRepresentativesAPIResponse.Representatives.List || 
      response.data.GetRepresentativesAPIResponse.Representatives.List.length === 0) {
    return null;
  }

  const rep = response.data.GetRepresentativesAPIResponse.Representatives.List[0];
  const rowData = [];

  // Add each field from the config
  config.fieldsToExtract.forEach(field => {
    let value = '';
    
    // Handle nested properties with dot notation
    if (field.includes('.')) {
      const parts = field.split('.');
      let current = rep;
      for (const part of parts) {
        if (current && current[part] !== undefined) {
          current = current[part];
        } else {
          current = '';
          break;
        }
      }
      value = current;
    } else {
      value = rep[field] !== undefined ? rep[field] : '';
    }
    
    rowData.push(value);
  });

  return rowData;
}

// Fetch a single representative by ID
async function fetchRepresentative(id) {
  const paddedId = id.toString().padStart(9, '0');
  
  try {
    // Generate random request token and headers for each request
    const requestToken = Math.floor(Math.random() * 10000000000);
    const csrfToken = [...Array(20)].map(() => Math.floor(Math.random() * 36).toString(36)).join('') + '=';
    
    // Create a copy of headers and update tokens
    const headers = { ...config.requestHeaders };
    headers["outsystems-request-token"] = requestToken.toString();
    headers["x-csrftoken"] = csrfToken;
    
    // Add randomized user agent
    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0"
    ];
    headers["user-agent"] = userAgents[Math.floor(Math.random() * userAgents.length)];
    
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        "versionInfo": {
          "moduleVersion": config.moduleVersion,
          "apiVersion": config.apiVersion
        },
        "viewName": "Detail.RepresentativeDetail",
        "screenData": {
          "variables": {
            "IsLoading_GetRepresentatives": true,
            "IsDownloadingPDF": false,
            "PDFDownload_ErrorMessage": "",
            "PDFDownload_HasError": false,
            "Licensees": {
              "TotalNumberOfRecords": 0,
              "Representatives": {
                "List": [],
                "EmptyListItem": {
                  "licenceNumber": "",
                  "licenceName": "",
                  "licenceCommencedDt": "",
                  "licenceCeasedDt": "",
                  "licenceAbn": "",
                  "entityType": "",
                  "repName": "",
                  "repNumber": "",
                  "repRole": "",
                  "repOtherRole": "",
                  "repAbn": "",
                  "repPrincipalBusinessAddress": "",
                  "repCommencedDt": "",
                  "repCeasedDt": "",
                  "repAddress": "",
                  "repAppointedByType": "",
                  "repAppointedByName": "",
                  "repAppointedByNumber": "",
                  "repAppointedByAbn": "",
                  "repBusinessNames": {
                    "List": [],
                    "EmptyListItem": {
                      "repBusinessName": "",
                      "repBusinessNameCommencedDt": ""
                    }
                  },
                  "repCommencedForLicenceDt": "",
                  "repCeasedForLicenceDt": "",
                  "repAuthSameAsLicensee": "",
                  "repClasses": {
                    "List": [],
                    "EmptyListItem": {
                      "repClasses": "",
                      "repClasseCode": ""
                    }
                  },
                  "repCrossEndorsements": {
                    "List": [],
                    "EmptyListItem": {
                      "repCrossEndorsement": ""
                    }
                  },
                  "organisationNumber": "",
                  "organisationType": "",
                  "repStatus": "",
                  "repOrganisationType": "",
                  "repOrganisationNumber": "",
                  "repPrincipalBusinessAddressForLicence": ""
                }
              },
              "base64string": ""
            },
            "TableSort": "licenceName",
            "SortDirection": "ASC",
            "Rep_StartIndex": 0,
            "Rep_skip": 0,
            "SortByChoices": {
              "List": [
                {
                  "ChoiceText": "Name (A - Z)",
                  "SortDirection": "ASC",
                  "SortField": "licenceName"
                },
                {
                  "ChoiceText": "Name (Z - A)",
                  "SortDirection": "DESC",
                  "SortField": "licenceName"
                },
                {
                  "ChoiceText": "Commenced (oldest first)",
                  "SortDirection": "ASC",
                  "SortField": "repCommencedForLicenceDt"
                },
                {
                  "ChoiceText": "Commenced (newest first)",
                  "SortDirection": "DESC",
                  "SortField": "repCommencedForLicenceDt"
                },
                {
                  "ChoiceText": "Ceased (oldest first)",
                  "SortDirection": "ASC",
                  "SortField": "repCeasedForLicenceDt"
                },
                {
                  "ChoiceText": "Ceased (newest first)",
                  "SortDirection": "DESC",
                  "SortField": "repCeasedForLicenceDt"
                }
              ]
            },
            "SelectedSortByChoice": "",
            "IsScrollToLicensees": false,
            "RepNumber": paddedId,
            "_repNumberInDataFetchStatus": 1,
            "PermissionType": "Credit representatives",
            "_permissionTypeInDataFetchStatus": 1
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ID ${paddedId}: ${error.message}`);
    return null;
  }
}

// Append data to Google Sheets
async function appendToSheet(sheets, values) {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: config.spreadsheetId,
      range: config.spreadsheetRange,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [values]
      }
    });
    return true;
  } catch (error) {
    console.error(`Error appending to Google Sheet: ${error.message}`);
    // Log more detailed error information
    if (error.response) {
      console.error(`Error details: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

// Sleep function for delays with jitter
function sleep(ms) {
  const jitter = Math.floor(Math.random() * 1000); // Add up to 1 second of jitter
  return new Promise(resolve => setTimeout(resolve, ms + jitter));
}

// Process a single ID
async function processId(sheets, id) {
  try {
    console.log(`Processing ID: ${id}`);
    const response = await fetchRepresentative(id);
    
    if (!response) {
      failedIds.push(id);
      return false;
    }
    
    const rowData = extractDataFromResponse(response);
    
    if (!rowData) {
      console.log(`No data found for ID: ${id}`);
      return true; // Consider it processed, just no data
    }
    
    // Add the ID at the beginning
    rowData.unshift(id);
    
    // Append to Google Sheets
    const success = await appendToSheet(sheets, rowData);
    if (!success) {
      failedIds.push(id);
      return false;
    }
    
    successful++;
    console.log(`Successfully processed ID: ${id}, total successful: ${successful}`);
    return true;
  } catch (error) {
    console.error(`Error processing ID ${id}: ${error.message}`);
    failedIds.push(id);
    return false;
  }
}

// Save to CSV as backup option if Google Sheets fails
function saveToCSV(data) {
  if (!data || data.length === 0) return;
  
  // Create headers if file doesn't exist
  const headers = ['ID', ...config.fieldsToExtract].join(',') + '\n';
  const filePath = config.backupCsvPath;
  
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, headers);
  }
  
  // Append data
  const csvLine = data.map(value => {
    // Handle commas and quotes in values
    if (value && typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }).join(',') + '\n';
  
  fs.appendFileSync(filePath, csvLine);
}

// Check if a row for this ID already exists in Google Sheets
async function findExistingRow(sheets, id) {
  try {
    // Get all data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: config.spreadsheetRange.split('!')[0], // Get the whole sheet
    });
    
    const rows = response.data.values || [];
    
    // Look for a row with matching ID in the first column
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] == id) { // Use == to handle string/number comparison
        return i + 1; // Return 1-based row index (as used by Sheets API)
      }
    }
    
    return null; // No matching row found
  } catch (error) {
    console.error(`Error searching for existing row: ${error.message}`);
    return null;
  }
}

// Check if headers already exist in the sheet
async function checkHeadersExist(sheets) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: `${config.spreadsheetRange.split('!')[0]}!A1:Z1`, // Get first row
    });
    
    return !!response.data.values && response.data.values.length > 0;
  } catch (error) {
    console.error(`Error checking headers: ${error.message}`);
    return false;
  }
}

// Check if CSV file exists and has headers
function checkCsvHeadersExist() {
  if (!fs.existsSync(config.backupCsvPath)) {
    return false;
  }
  
  try {
    const firstLine = fs.readFileSync(config.backupCsvPath, 'utf8').split('\n')[0];
    return !!firstLine && firstLine.toLowerCase().includes('id'); // Basic check if headers exist
  } catch (error) {
    return false;
  }
}

// Find highest ID in the CSV to resume from
function findHighestIdInCsv() {
  if (!fs.existsSync(config.backupCsvPath)) {
    return null;
  }
  
  try {
    const lines = fs.readFileSync(config.backupCsvPath, 'utf8').split('\n');
    if (lines.length <= 1) return null; // Only header or empty file
    
    let highestId = 0;
    
    // Skip header row (index 0)
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines
      
      const id = parseInt(lines[i].split(',')[0]);
      if (!isNaN(id) && id > highestId) {
        highestId = id;
      }
    }
    
    return highestId > 0 ? highestId : null;
  } catch (error) {
    console.error(`Error reading CSV for highest ID: ${error.message}`);
    return null;
  }
}

// Update existing row in Google Sheets
async function updateExistingRow(sheets, rowIndex, values) {
  try {
    const range = `${config.spreadsheetRange.split('!')[0]}!A${rowIndex}`;
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.spreadsheetId,
      range: range,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [values]
      }
    });
    
    return true;
  } catch (error) {
    console.error(`Error updating row ${rowIndex}: ${error.message}`);
    return false;
  }
}

// Update or append to CSV
function updateOrAppendToCsv(id, data) {
  if (!fs.existsSync(config.backupCsvPath)) {
    // Create new file with headers
    const headers = ['ID', ...config.fieldsToExtract].join(',') + '\n';
    fs.writeFileSync(config.backupCsvPath, headers);
    
    // Append data
    const csvLine = data.map(value => {
      if (value && typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',') + '\n';
    
    fs.appendFileSync(config.backupCsvPath, csvLine);
    return;
  }
  
  // File exists, read it
  const lines = fs.readFileSync(config.backupCsvPath, 'utf8').split('\n');
  
  // Check if ID already exists
  let found = false;
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const lineId = parseInt(lines[i].split(',')[0]);
    if (lineId === id) {
      // Replace line
      const csvLine = data.map(value => {
        if (value && typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
      
      lines[i] = csvLine;
      found = true;
      break;
    }
  }
  
  if (!found) {
    // Append to end
    const csvLine = data.map(value => {
      if (value && typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
    
    lines.push(csvLine);
  }
  
  // Write back to file
  fs.writeFileSync(config.backupCsvPath, lines.join('\n'));
}

// Main execution function
async function main() {
  let sheets = null;
  let useCsv = config.outputMode === "csv" || config.outputMode === "both";
  let useSheets = config.outputMode === "sheets" || config.outputMode === "both";
  
  console.log(`Output mode: ${config.outputMode}`);
  
  try {
    // Setup Google Sheets if needed
    if (useSheets) {
      try {
        sheets = await setupGoogleSheets();
        console.log("Successfully connected to Google Sheets");
      } catch (error) {
        console.error(`Could not connect to Google Sheets: ${error.message}`);
        if (config.outputMode === "sheets") {
          console.log("Falling back to CSV since Google Sheets connection failed");
          useCsv = true;
        }
        sheets = null;
      }
    }
    
    // Determine starting point if resuming
    if (config.resumeFromLastId) {
      let highestId = null;
      
      // Check if we should resume from CSV
      if (useCsv) {
        const highestIdInCsv = findHighestIdInCsv();
        if (highestIdInCsv !== null && highestIdInCsv >= startId) {
          highestId = highestIdInCsv;
        }
      }
      
      if (highestId !== null) {
        const newStartId = highestId + 1;
        console.log(`Resuming from ID ${newStartId} based on existing data`);
        currentId = newStartId;
        
        // Don't go past the end ID
        if (currentId > endId) {
          console.log(`Starting ID ${currentId} is greater than ending ID ${endId}. Nothing to process.`);
          return;
        }
      }
    }
    
    // Check if headers already exist
    let sheetsHeadersExist = false;
    let csvHeadersExist = false;
    
    if (useSheets && sheets) {
      sheetsHeadersExist = await checkHeadersExist(sheets);
      console.log(`Headers in Google Sheet: ${sheetsHeadersExist ? 'Exist' : 'Do not exist'}`);
    }
    
    if (useCsv) {
      csvHeadersExist = checkCsvHeadersExist();
      console.log(`Headers in CSV: ${csvHeadersExist ? 'Exist' : 'Do not exist'}`);
    }
    
    // Add header row if configured and not already present
    if (config.addHeaderRow) {
      const headerRow = ['ID', ...config.fieldsToExtract];
      
      if (useSheets && sheets && !sheetsHeadersExist) {
        await appendToSheet(sheets, headerRow);
        console.log("Added header row to Google Sheet");
      }
      
      if (useCsv && !csvHeadersExist) {
        if (!fs.existsSync(config.backupCsvPath)) {
          fs.writeFileSync(config.backupCsvPath, headerRow.join(',') + '\n');
          console.log("Added header row to CSV file");
        }
      }
    }
    
    // Process all IDs in the range
    while (currentId <= endId) {
      // Fetch the data
      console.log(`Processing ID: ${currentId}`);
      const response = await fetchRepresentative(currentId);
      
      if (response) {
        const rowData = extractDataFromResponse(response);
        
        if (rowData) {
          // Add the ID at the beginning
          rowData.unshift(currentId);
          
          // Handle Google Sheets output if enabled
          if (useSheets && sheets) {
            // Check if row already exists
            const existingRowIndex = await findExistingRow(sheets, currentId);
            
            if (existingRowIndex) {
              console.log(`Updating existing row for ID ${currentId} at row ${existingRowIndex}`);
              await updateExistingRow(sheets, existingRowIndex, rowData);
            } else {
              console.log(`Appending new row for ID ${currentId}`);
              await appendToSheet(sheets, rowData);
            }
          }
          
          // Handle CSV output if enabled
          if (useCsv) {
            updateOrAppendToCsv(currentId, rowData);
          }
          
          successful++;
          console.log(`Successfully processed ID: ${currentId}, total successful: ${successful}`);
        } else {
          console.log(`No data found for ID: ${currentId}`);
        }
      } else {
        failedIds.push(currentId);
      }
      
      // Add delay with jitter
      const delay = config.requestIntervalMs + Math.floor(Math.random() * 1000);
      console.log(`Waiting ${delay}ms before next request...`);
      await sleep(delay);
      
      currentId++;
    }
    
    // Retry failed IDs
    console.log(`Initial pass complete. Failed IDs: ${failedIds.length}`);
    
    if (failedIds.length > 0 && config.retryFailedIds) {
      console.log('Retrying failed IDs...');
      
      // Make a copy of failed IDs to retry
      const idsToRetry = [...failedIds];
      failedIds.length = 0; // Clear the array for the retry round
      
      for (const id of idsToRetry) {
        const response = await fetchRepresentative(id);
        
        if (response) {
          const rowData = extractDataFromResponse(response);
          
          if (rowData) {
            // Add the ID at the beginning
            rowData.unshift(id);
            
            // Handle Google Sheets output if enabled
            if (useSheets && sheets) {
              // Check if row already exists
              const existingRowIndex = await findExistingRow(sheets, id);
              
              if (existingRowIndex) {
                await updateExistingRow(sheets, existingRowIndex, rowData);
              } else {
                await appendToSheet(sheets, rowData);
              }
            }
            
            // Handle CSV output if enabled
            if (useCsv) {
              updateOrAppendToCsv(id, rowData);
            }
            
            successful++;
            console.log(`Successfully processed ID: ${id} on retry, total successful: ${successful}`);
          } else {
            console.log(`No data found for ID: ${id} on retry`);
          }
        } else {
          failedIds.push(id);
        }
        
        await sleep(config.requestIntervalMs + Math.floor(Math.random() * 2000)); // More variation in retry
      }
    }
    
    // Log the final results
    console.log('==== Fetch Complete ====');
    console.log(`Total IDs processed: ${endId - startId + 1}`);
    console.log(`Successfully fetched: ${successful}`);
    console.log(`Failed IDs: ${failedIds.length}`);
    
    // Write failed IDs to file if any remain
    if (failedIds.length > 0) {
      fs.writeFileSync('failed_ids.json', JSON.stringify(failedIds, null, 2));
      console.log('Failed IDs written to failed_ids.json');
    }
    
    // Retry failed IDs
    console.log(`Initial pass complete. Failed IDs: ${failedIds.length}`);
    
    if (failedIds.length > 0 && config.retryFailedIds) {
      console.log('Retrying failed IDs...');
      
      // Make a copy of failed IDs to retry
      const idsToRetry = [...failedIds];
      failedIds.length = 0; // Clear the array for the retry round
      
      for (const id of idsToRetry) {
        const response = await fetchRepresentative(id);
        
        if (response) {
          const rowData = extractDataFromResponse(response);
          
          if (rowData) {
            // Add the ID at the beginning
            rowData.unshift(id);
            
            // Try to update/append to Google Sheets
            if (sheets) {
              // Check if row already exists
              const existingRowIndex = await findExistingRow(sheets, id);
              
              if (existingRowIndex) {
                await updateExistingRow(sheets, existingRowIndex, rowData);
              } else {
                await appendToSheet(sheets, rowData);
              }
            }
            
            // Update CSV
            updateOrAppendToCsv(id, rowData);
            
            successful++;
            console.log(`Successfully processed ID: ${id} on retry, total successful: ${successful}`);
          } else {
            console.log(`No data found for ID: ${id} on retry`);
          }
        } else {
          failedIds.push(id);
        }
        
        await sleep(config.requestIntervalMs + Math.floor(Math.random() * 2000)); // More variation in retry
      }
    }
    
    // Log the final results
    console.log('==== Fetch Complete ====');
    console.log(`Total IDs processed: ${endId - startId + 1}`);
    console.log(`Successfully fetched: ${successful}`);
    console.log(`Failed IDs: ${failedIds.length}`);
    
    // Write failed IDs to file if any remain
    if (failedIds.length > 0) {
      fs.writeFileSync('failed_ids.json', JSON.stringify(failedIds, null, 2));
      console.log('Failed IDs written to failed_ids.json');
    }
    
  } catch (error) {
    console.error(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main();