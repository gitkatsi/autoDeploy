var events = require("events");
var event = new events;


  const fs = require('fs');
  const readline = require('readline');
  const {
    google
  } = require('googleapis');
  const path = require("path")
  // If modifying these scopes, delete token.json.
  const SCOPES = ['https://www.googleapis.com/auth/drive'];
  const TOKEN_PATH = 'token.json';

  const startActions = function(){
  // Load client secrets from a local file.
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    authorize(JSON.parse(content), driveHandler);
  });
}

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



  function listFiles(drive) {
    var fileData = new Array
    return new Promise((resolve, reject) => {

      drive.files.list({
        fields: 'nextPageToken, files(id, name, parents, mimeType, modifiedTime)',
        q: `'1E3OLXnc4fb3TYQPqtqux4QUSUdalMfRj' in parents and trashed = false`
      }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const files = res.data.files;
        if (files.length) {
          files.map((file) => {
            fileData.push(file)
          });
        } else {
          console.log('No files found.');
        }
        resolve(fileData)
      })

    })
  }
  

  async function getFiles(drive) {
    var count = 0;
    var fileData = await checkFolders(drive);
    if (fileData.length === 0){
      console.log('No changes detected!!!')
    }
    return new Promise((resolve, reject) => {
    fileData.forEach(element => {
      try{
        console.log(`${element.name} ${element.mimeType}`)
        if (element.mimeType === "application/vnd.google-apps.file"){
          return
        }
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
              count = count + 1;
              console.log(`Finished downloading ${element.name}`)

              if (count === fileData.length) {
                resolve(true);
                console.log("I got all the new files...")
              }
              }
            )
            .on('error', err => {
              console.log('Error', err);
            })
            .pipe(dest);
            
        }
      )
      } catch (error) {
        reject(error)
        console.log(error);
      }
    });
    
     })
  }


var checkForChanges = async function(drive)
{
  tokenNew = await getToken(drive)
  var savedToken = JSON.parse(fs.readFileSync(path.join(__dirname, "lastCheck.json"), "utf-8"))
  pageToken = savedToken.token
  savedToken.token = tokenNew
  fs.writeFileSync(path.join(__dirname, "lastCheck.json"), JSON.stringify(savedToken))
  return new Promise((resolve, reject) => {
  drive.changes.list({
    pageToken: pageToken,
    fields: '*'
  }, (err, resp) => {
    if (err) {
      reject(err);
    } else {
      resolve(resp.data.changes)
    }
  })
})
}

var getToken = function(drive){
  var token;
  return new Promise((resolve, reject) => {
drive.changes.getStartPageToken({}, function (err, res) {
  console.log('Looking for changes');
  resolve(res.data.startPageToken)
});
  })}


var checkFolders = async function (drive){
  var fileDataFolder = await listFiles(drive);
  var fileDataChangedArray = await checkForChanges(drive);
  var fileDataChanged = fileDataChangedArray.map(a => a.fileId);
  var downloadList = new Array;
return new Promise((resolve,reject)=>{
for(i=0; i<fileDataFolder.length; i++){

  if (fileDataChanged.indexOf(fileDataFolder[i].id) > -1) {
  downloadList.push(fileDataFolder[i])
  }
}
resolve(downloadList)
})
}


var driveHandler = async function(auth) {
      const drive = google.drive({
        version: 'v3',
        auth
      })
  await getFiles(drive);
  event.emit("newFiles")
}


//startActions();


module.exports.start = startActions;
module.exports.status = event;