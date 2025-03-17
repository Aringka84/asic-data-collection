# asic-data-collection


Project Overview

Designed to fetch representative data from the ASIC (Australian Securities and Investments Commission) API, process that data, and store it in either Google Sheets or a CSV file or both. The configuration for the API, request behavior, and output options are defined in a separate configuration file.


##Setup- Install Node.js

Prerequisites

## sudo apt update
## sudo apt install curl

Step 1: Install NVM (Node Version Manager)

Run the following command to download and install NVM:

## curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

After the installation, you need to load NVM. You can do this by adding the following lines to your `~/.bashrc` or `~/.bash_profile`:

## export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

Then, run:

## source ~/.bashrc

Step 2: Install the Latest Version of Node.js
    Now that NVM is installed, you can install the latest version of Node.js by running:

##   nvm install node

You can verify the installation by checking the Node.js version:
##   node -v

Step 3: Set Default Node.js Version
To set the installed version as the default, run:

## nvm alias default node

Install Git:
## sudo apt update
## sudo apt install git

Create a new directory for the project and navigate into it

## mkdir asic-data-collection

Navigate to the asic-data-collection directory

## cd asic-data-collection

## git clone https://github.com/Aringka84/asic-data-collection

## npm install -g npm@11.2.0

    
New Screen Session
## sudo apt install screen


Start/Run:

## screen -S <Session-NAME>
    
##node fetchRepresentatives.js <starting-id> <Ending-id> 
Be sure to enter starting/ending id #


---------------------------------------------------------

Key Components

Configuration File (config.js)
This file exports an object containing various settings for the API requests, including:

    API URL: The endpoint for fetching representative details.

    Request Headers: Necessary headers for the API requests speed of requests.

    Request Behavior: Settings for request intervals, retries, and handling of existing data.

    Google Sheet Configuration: Details for connecting to Google Sheets, including the spreadsheet ID and range.

    Output Options: Specifies whether to output data to CSV, Google Sheets, or both.

    Fields to Extract: An array of fields that will be extracted from the API response.


##Fetching Logic (fetchRepresentatives.js)

This file contains the main logic for fetching data from the ASIC API and processing it.

    Command Line Arguments:
    The script can accept start and end IDs as command line arguments to define the range of representatives to fetch.

    Google Sheets Setup:
    It initializes a connection to Google Sheets using service account credentials.

    Data Extraction:
    The extractDataFromResponse function processes the API response to extract relevant fields based on the configuration.

    Fetching Representatives:
    The fetchRepresentative function makes a POST request to the API for a specific representative ID, handling errors and response parsing.

    Appending Data:
    The appendToSheet function appends the fetched data to Google Sheets, while the saveToCSV function saves data to a CSV file as a backup.

    Processing IDs:
    The processId function manages the fetching and processing of each representative ID, including error handling and logging.

    Main Execution Function:
    The main function orchestrates the entire process, including setting up Google Sheets, checking for existing data, and iterating through the specified ID range to fetch and store data.

##Error Handling and Logging
    The script includes comprehensive error handling to manage issues during API requests, data processing, and file operations.
    It logs the status of each operation, including successful fetches, failures, and retries.

##CSV Local and Resume Functionality
    Supports resuming from the last processed ID by checking existing data in the CSV file.
    If the script is interrupted or fails, it can continue from where it left off by reading the highest ID from the CSV.

##Output Options
You can configure whether to output data to Google Sheets, CSV, or both. The script handles the creation of headers in both outputs if they do not already exist.


##How It Works
    Initialization: The script starts by loading the configuration and setting up command line arguments for the ID range.

    Google Sheets Setup: It attempts to connect to Google Sheets using the provided service account credentials.

    Data Processing:
        It checks if it should resume from the last processed ID based on existing data in the CSV.

        It iterates through the specified range of IDs, fetching data for each representative.

        For each ID, it extracts the relevant fields and appends the data to Google Sheets or saves it to a CSV file.

##Error Handling: 
If any fetch fails, the ID is logged for retrying later.

##Final Logging: 
After processing all IDs, it logs the total number of successful fetches and any failed IDs.



Optional-- Google Sheets API Setup
--------------------------------
Create a Google Cloud Platform Project

Go to the Google Cloud Console
Create a new project or select an existing one
Make note of your Project ID

Enable the Google Sheets API

In your GCP project, go to "APIs & Services" > "Library"
Search for "Google Sheets API"
Click on it and press "Enable"

Create a Service Account

Go to "APIs & Services" > "Credentials"
Click "Create Credentials" > "Service Account"
Enter a name for your service account (e.g., "asic-data-fetcher")
Optionally add a description
Click "Create and Continue"
For the role, select "Project" > "Editor" (or a more specific role if you prefer)
Click "Continue" and then "Done"

Create and Download a Service Account Key

In the Credentials page, find your service account in the list
Click on it to open the service account details
Go to the "Keys" tab
Click "Add Key" > "Create new key"
Choose "JSON" format
Click "Create" to generate and download the key file

Save the Key File

Rename the downloaded file to service-account-key.json
Place it in the same directory as your script
Ensure this file is kept secure and never committed to public repositories

Share Your Google Sheet

Create a new Google Sheet or use an existing one
Click the "Share" button in the top right
In the service account key file, find the client_email field
Add this email address as an editor to your Google Sheet
Copy the spreadsheet ID from the URL (the long string between /d/ and /edit)
Update the spreadsheetId in your config.js file