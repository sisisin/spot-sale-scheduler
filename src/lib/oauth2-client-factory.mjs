import fs from 'fs';
import util from 'util';
const promisify = util.promisify;
const readFilePromise = promisify(fs.readFile);
import readline from 'readline';
import path from 'path';
import google from 'googleapis';
import googleAuth from 'google-auth-library';
import clientSecretJson from '../client-secret.json';

// NOTE: If modifying these scopes, delete your previously saved credentials
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/calendar'];
const TOKEN_DIR = '.credentials/';
const TOKEN_PATH = path.join(TOKEN_DIR, 'spot-sale-scheduler.json');

export const OAuth2ClientFactory = {
  async create() {
    const clientSecret = clientSecretJson.installed.client_secret;
    const clientId = clientSecretJson.installed.client_id;
    const redirectUrl = clientSecretJson.installed.redirect_uris[0];
    const auth = new googleAuth();
    const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    try {
      const token = await readFilePromise(TOKEN_PATH);
      oauth2Client.credentials = JSON.parse(token);
      return oauth2Client;
    } catch (err) {
      return getNewToken(oauth2Client);
    }
  }
};

/**
 * Get and store new token after prompting for user authorization, and then
 * return Promise with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 */
async function getNewToken(oauth2Client) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve, reject) => {
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oauth2Client.getToken(code, (err, token) => {
        if (err) {
          console.log('Error while trying to retrieve access token', err);
          return reject(err);
        }
        oauth2Client.credentials = token;
        storeToken(token);
        resolve(oauth2Client);
      });
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  fs.mkdir(TOKEN_DIR, err => {
    if (err && err.code !== 'EEXIST') { throw err; }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
      if (err) { throw err; }
      console.log('Token stored to ' + TOKEN_PATH);
    });
  });
}
