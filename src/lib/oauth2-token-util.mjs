import fs from 'fs';
import readline from 'readline';
import { TOKEN_PATH, TOKEN_DIR } from './constant';
import clientSecretJson from '../client-secret.json';
import googleAuth from 'google-auth-library';

// NOTE: If modifying these scopes, delete your previously saved credentials
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/calendar'];

export const TokenGeneratorFactory = {
  async create() {
    return new TokenGenerator(TOKEN_PATH, TOKEN_DIR, googleAuth, readline);
  }
}

export class TokenGenerator {
  constructor(tokenPath, tokenDir, googleAuth, readline) {
    this.tokenPath = tokenPath;
    this.tokenDir = tokenDir;
    this.googleAuth = googleAuth;
    this.readline = readline;
  }

  async generateToken() {
    const clientSecret = clientSecretJson.installed.client_secret;
    const clientId = clientSecretJson.installed.client_id;
    const redirectUrl = clientSecretJson.installed.redirect_uris[0];
    const auth = new this.googleAuth();
    const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
    const code = await this.getCode(oauth2Client);
    return this.getAndStoreToken(oauth2Client, code);
  }

  async getCode(oauth2Client) {
    const authUrl = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
    console.log('Authorize this app by visiting this url: ', authUrl);

    const rl = this.readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
      rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        resolve(code);
      });
    });
  }

  async getAndStoreToken(oauth2Client, code) {
    return new Promise((resolve, reject) => {
      oauth2Client.getToken(code, (err, token) => {
        if (err) {
          console.log('Error while trying to retrieve access token', err);
          return reject(err);
        }
        this.storeToken(token);
        resolve();
      });
    });
  }

  /**
   * Store token to disk be used in later program executions.
   *
   * @param {Object} token The token to store to disk.
   */
  async storeToken(token) {
    try {
      fs.mkdirSync(this.tokenDir);
    } catch (err) {
      if (err.code !== 'EEXIST') { throw err; }
    }
    try {
      fs.writeFileSync(this.tokenPath, JSON.stringify(token));
    } catch (err) {
      throw err;
    }
    console.log('Token stored to ' + this.tokenPath);
  }
}
