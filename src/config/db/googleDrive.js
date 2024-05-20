const fs = require("fs");
const { google } = require("googleapis");

const apikeys = require("../../DriveCreds.json");
const SCOPE = ["https://www.googleapis.com/auth/drive"];

// A Function that can provide access to google drive api
async function authorize() {
  const jwtClient = new google.auth.JWT(
    apikeys.client_email,
    null,
    apikeys.private_key,
    SCOPE
  );

  await jwtClient.authorize();

  return jwtClient;
}

// A Function that will upload the desired file to google drive folder
async function uploadFile(authClient) {
  console.log("Uploading...");
  return new Promise((resolve, rejected) => {
    const drive = google.drive({ version: "v3", auth: authClient });

    var fileMetaData = {
      name: "mydrivetext.txt",
      //parents: ["1BHXt7gFyOVyZ08yPwdk7dOhhIuAkdepv"], // A folder ID to which file will get uploaded
      parents: ["1BHXt7gFyOVyZ08yPwdk7dOhhIuAkdepv"], // A folder ID to which file will get uploaded
    };

    drive.files.create(
      {
        resource: fileMetaData,
        media: {
          body: fs.createReadStream("test.txt"), // files that will get uploaded
          mimeType: "text/plain",
        },
        fields: "id",
      },
      function (error, file) {
        if (error) {
          return rejected(error);
        }
        console.log("Uploaded...");
        resolve(file);
      }
    );
  });
}

async function listFilesInFolder(authClient, folderId) {
  const drive = google.drive({ version: "v3", auth: authClient });

  return new Promise((resolve, reject) => {
    drive.files.list(
      {
        q: `'${folderId}' in parents`,
        fields: "files(id, name)",
      },
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.data.files);
        }
      }
    );
  });
}

//Upload
//authorize().then(uploadFile).catch(error => console.error(error)); // function call

async function listMp3FilesWithLinks(authClient, folderId) {
  const drive = google.drive({ version: 'v3', auth: authClient });

  return new Promise((resolve, reject) => {
      drive.files.list({
          q: `'${folderId}' in parents and mimeType='audio/mpeg'`,
          fields: 'files(id, name, webContentLink)',
      }, (err, res) => {
          if (err) {
              reject(err);
          } else {
              resolve(res.data.files);
          }
      });
  });
}

authorize()
    .then(authClient => {
        const folderId = '1_1gDZ3TDs8AR-_M1fuNDreaV2vBJw47J'; // Specify the folder ID
        return listMp3FilesWithLinks(authClient, folderId);
    })
    .then(files => {
        console.log('MP3 Files in the folder:');
        files.forEach(file => {
            console.log(`${file.name} (${file.id}) - Download Link: ${file.webContentLink}`);
        });
    })
    .catch(error => {
        console.error('Error listing MP3 files:', error);
    });
