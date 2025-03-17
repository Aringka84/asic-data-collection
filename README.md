# asic-data-collection


## Project Overview

Designed to fetch representative data from the ASIC (Australian Securities and Investments Commission) API, process that data, and store it in either Google Sheets or a CSV file or both. The configuration for the API, request behavior, and output options are defined in a separate configuration file.


## Setup - Install Node.js

### Prerequisites
```bash
sudo apt update
sudo apt install curl
```

### Step 1: Install NVM (Node Version Manager)
Run the following command to download and install NVM:

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

After the installation, you need to load NVM. You can do this by adding the following lines to your `~/.bashrc` or `~/.bash_profile`:

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

Then, run:

    source ~/.bashrc

## Step 2: Install the Latest Version of Node.js
    Now that NVM is installed, you can install the latest version of Node.js by running:
    nvm install node

You can verify the installation by checking the Node.js version:
    node -v

## Step 3: Set Default Node.js Version
To set the installed version as the default, run:
nvm alias default node

##Install Git:
    sudo apt update
    sudo apt install git

##Create a new directory for the project and navigate into it

    mkdir asic-data-collection

##Navigate to the asic-data-collection directory

    cd asic-data-collection

    git clone https://github.com/Aringka84/asic-data-collection

    npm install -g npm@11.2.0

    
New Screen Session
    sudo apt install screen


##Start/Run:

    screen -S <Session-NAME>
    
    node fetchRepresentatives.js <starting-id> <Ending-id> 


---------------------------------------------------------
## Key Components

### Configuration File (config.js)
This file exports an object containing various settings for the API requests, including:
- **API URL**: The endpoint for fetching representative details.
- **Request Headers**: Necessary headers for the API requests.
- **Request Behavior**: Settings for request intervals, retries, and handling of existing data.
- **Google Sheet Configuration**: Details for connecting to Google Sheets, including the spreadsheet ID and range.
- **Output Options**: Specifies whether to output data to CSV, Google Sheets, or both.
- **Fields to Extract**: An array of fields that will be extracted from the API response.

### Fetching Logic (fetchRepresentatives.js)
This file contains the main logic for fetching data from the ASIC API and processing it.

- **Command Line Arguments**: The script can accept start and end IDs as command line arguments to define the range of representatives to fetch.
- **Google Sheets Setup**: It initializes a connection to Google Sheets using service account credentials.
- **Data Extraction**: The `extractDataFromResponse` function processes the API response to extract relevant fields based on the configuration.
- **Fetching Representatives**: The `fetchRepresentative` function makes a POST request to the API for a specific representative ID, handling errors and response parsing.
- **Appending Data**: The `appendToSheet` function appends the fetched data to Google Sheets, while the `saveToCSV` function saves data to a CSV file as a backup.
- **Processing IDs**: The `processId` function manages the fetching and processing of each representative ID, including error handling and logging.
- **Main Execution Function**: The main function orchestrates the entire process, including setting up Google Sheets, checking for existing data, and iterating through the specified ID range to fetch and store data.

### Error Handling and Logging
The script includes comprehensive error handling to manage issues during API requests, data processing, and file operations. It logs the status of each operation, including successful fetches, failures, and retries.

### CSV Local and Resume Functionality
Supports resuming from the last processed ID by checking existing data in the CSV file. If the script is interrupted or fails, it can continue from where it left off by reading the highest ID from the CSV.

### Output Options
You can configure whether to output data to Google Sheets, CSV, or both. The script handles the creation of headers in both outputs if they do not already exist.

## How It Works
- **Initialization**: The script starts by loading the configuration and setting up command line arguments for the ID range.
- **Google Sheets Setup**: It attempts to connect to Google Sheets using the provided service account credentials.
- **Data Processing**:
    - It checks if it should resume from the last processed ID based on existing data in the CSV.
    - It iterates through the specified range of IDs, fetching data for each representative.
    - For each ID, it extracts the relevant fields and appends the data to Google Sheets or saves it to a CSV file.

### Error Handling
If any fetch fails, the ID is logged for retrying later.

### Final Logging
After processing all IDs, it logs the total number of successful fetches and any failed IDs.

## Optional - Google Sheets API Setup
### Create a Google Cloud Platform Project
1. Go to the Google Cloud Console.
2. Create a new project or select an existing one.
3. Make note of your Project ID.

### Enable the Google Sheets API
1. In your GCP project, go to "APIs & Services" > "Library".
2. Search for "Google Sheets API".
3. Click on it and press "Enable".

### Create a Service Account
1. Go to "APIs & Services" > "Credentials".
2. Click "Create Credentials" > "Service Account".
3. Enter a name for your service account (e.g., "asic-data-fetcher").
4. Optionally add a description.
5. Click "Create and Continue".
6. For the role, select "Project" > "Editor" (or a more specific role if you prefer).
7. Click "Continue" and then "Done".

### Create and Download a Service Account Key
1. In the Credentials page, find your service account in the list.
2. Click on it to open the service account details.
3. Go to the "Keys" tab.
4. Click "Add Key" > "Create new key".
5. Choose "JSON" format.
6. Click "Create" to generate and download the key file.

### Save the Key File
Rename the downloaded file to `service-account-key.json`. Place it in the same directory as your script. Ensure this file is kept secure and never committed to public repositories.

### Share Your Google Sheet
1. Create a new Google Sheet or use an existing one.
2. Click the "Share" button in the top right.
3. In the service account key file, find the `client_email` field.
4. Add this email address as an editor to your Google Sheet.
5. Copy the spreadsheet ID from the URL (the long string between `/d/` and `/edit`).
6. Update the `spreadsheetId` in your `config.js` file.