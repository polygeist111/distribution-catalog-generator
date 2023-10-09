
        //<button id="authorize_button" onclick="handleAuthClick()">Authorize</button>
        //<button id="signout_button" onclick="handleSignoutClick()">Sign Out</button>
    let authorize_button;
    let signout_button;
    

      // exported gapiLoaded
      // exported gisLoaded
      // exported handleAuthClick
      // exported handleSignoutClick

      // TODO(developer): Set to client ID and API key from the Developer Console
      const CLIENT_ID = '149787687644-ghf4l40amb20cmnq2oj2fnmapnu4bui1.apps.googleusercontent.com';
      const API_KEY = 'AIzaSyBqazQ2_rOprHCKF-WfZx4Opu1cz0Ry604';

      // Discovery doc URL for APIs used by the quickstart
      const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';

      // Authorization scopes required by the API; multiple scopes can be
      // included, separated by spaces.
      const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';

      let tokenClient;
      let gapiInited = false;
      let gisInited = false;

      document.getElementById('authorize_button').style.visibility = 'hidden';
      document.getElementById('signout_button').style.visibility = 'hidden';

        /*
      //Sets up buttons
      function setup() {
        
        authorize_button = createButton('Authorize');
        authorize_button.mousePressed(handleAuthClick);
        authorize_button.hide();

        signout_button = createButton('Sign Out');
        signout_button.mousePressed(handleSignoutClick);
        signout_button.hide();
        //button1.position(width * 0.5 - button1.width * 0.5,  height * -0.5 + button1.height * -0.5, "relative");

      }*/
      
      //Callback after api.js is loaded.  
      function gapiLoaded() {
        gapi.load('client', initializeGapiClient);
      }

    
      //Callback after the API client is loaded. Loads the
      //discovery doc to initialize the API.
      async function initializeGapiClient() {
        await gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        maybeEnableButtons();
      }

      //Callback after Google Identity Services are loaded.
      function gisLoaded() {
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: '', // defined later
        });
        gisInited = true;
        maybeEnableButtons();
      }

      //Enables user interaction after all libraries are loaded.
      function maybeEnableButtons() {
        if (gapiInited && gisInited) {
          document.getElementById('authorize_button').style.visibility = 'visible';
          //authorize_button.show();
        }
      }

      //Sign in the user upon button click.
      function handleAuthClick() {
        tokenClient.callback = async (resp) => {
          if (resp.error !== undefined) {
            throw (resp);
          }
          document.getElementById('signout_button').style.visibility = 'visible';
          //signout_button.show();
          //authorize_button.html("Refresh");
          document.getElementById('authorize_button').innerText = 'Refresh';
          await listMajors();
        };

        if (gapi.client.getToken() === null) {
          // Prompt the user to select a Google Account and ask for consent to share their data
          // when establishing a new session.
          tokenClient.requestAccessToken({prompt: 'consent'});
        } else {
          // Skip display of account chooser and consent dialog for an existing session.
          tokenClient.requestAccessToken({prompt: ''});
        }
      }
      
      //Sign out the user upon button click.
      function handleSignoutClick() {
        const token = gapi.client.getToken();
        if (token !== null) {
          google.accounts.oauth2.revoke(token.access_token);
          gapi.client.setToken('');
          //content.html("");
          document.getElementById('content').innerText = '';
          //authorize_button.html("Authorize");
          document.getElementById('authorize_button').innerText = 'Authorize';
          //signout_button.hide();
          document.getElementById('signout_button').style.visibility = 'hidden';
        }
      }
      
      //Print the names and majors of students in a sample spreadsheet: 
      //https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
      async function listMajors() {
        let response;
        try {
          // Fetch first 10 files
          response = await gapi.client.sheets.spreadsheets.values.get({
            //spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
            spreadsheetId: "1BQ_PvKodVuq5UxEUaDfyRRiaMoPyxqsSMFmdRXcdHzQ",
            range: 'TradePricingConcise!D2:E',
          });
        } catch (err) {
          document.getElementById('content').innerText = err.message;
          //content.html(err.message);

          return;
        }
        const range = response.result;
        if (!range || !range.values || range.values.length == 0) {
          document.getElementById('content').innerText = 'No values found.';
          //content.html("No values found");

          return;
        }
        // Flatten to string to display
        const priceResult = response.result.values;
        //console.log(priceResult);
        //console.log(priceResult[2][1]);
        filterPrices(priceResult);
        const output = range.values.reduce(
            (str, row) => `${str}${row[0]}, ${row[1]}\n`,
            'SKU, Trade Price:\n');
        document.getElementById('content').innerText = output;
        //content.html(output);

      }