function getFiles() {

  const fs = require('fs');
  const readline = require('readline');
  const {
    google
  } = require('googleapis');
  const path = require("path")
  // If modifying these scopes, delete token.json.
  const SCOPES = ['https://www.googleapis.com/auth/drive'];
  const TOKEN_PATH = 'token.json';

  // Load client secrets from a local file.
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    authorize(JSON.parse(content), getFile);
  });

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  function authorize(credentials, callback) {
    const {
      client_secret,
      client_id,
      redirect_uris
    } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getAccessToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) console.error(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
    });
  }

  /**
   * Lists the names and IDs of up to 10 files.
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */



  function fetchfile(drive) {
    var fileData = new Array
    return new Promise((resolve, reject) => {

      drive.files.list({
        fields: 'nextPageToken, files(id, name, parents, mimeType, modifiedTime)',
        q: `'1E3OLXnc4fb3TYQPqtqux4QUSUdalMfRj' in parents and trashed = false`
      }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const files = res.data.files;
        if (files.length) {
          console.log('Files:');
          files.map((file) => {
            console.log(`${file.name} (${file.id}) (${file.mimeType})`);
            fileData.push(file)
          });
        } else {
          console.log('No files found.');
        }
        resolve(fileData)
      })

    })
  }

  async function getFile(auth) {
    const drive = google.drive({
      version: 'v3',
      auth
    })
    var fileData = await fetchfile(drive)
    fileData.forEach(element => {
      var dest = fs.createWriteStream(path.join(__dirname, "downloads", element.name));
      drive.files.get({
          fileId: element.id,
          alt: 'media',

        }, {
          responseType: 'stream'
        },
        function (err, res) {
          res.data
            .on('end', () => {
              console.log('Done');
            })
            .on('error', err => {
              console.log('Error', err);
            })
            .pipe(dest);
        }
      )
    });
  }
}

module.exports.getFiles = getFiles();