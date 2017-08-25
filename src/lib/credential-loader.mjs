import fs from 'fs';
import util from 'util';
const readFilePromise = util.promisify(fs.readFile);
import { TOKEN_PATH } from './constant';

export const CredentialLoaderFactory = {
  create() {
    return new CredentialLoader(TOKEN_PATH);
  }
};

export class CredentialLoader {
  constructor(tokenPath) {
    this.tokenPath = tokenPath;
  }

  async load() {
    try {
      const token = await readFilePromise(this.tokenPath);
      return JSON.parse(token);
    } catch (err) {
      if (err.code !== 'ENOENT') { throw err; }
      return this.loadFromEnv();
    }
  }

  loadFromEnv() {
    const { ACCESS_TOKEN, REFRESH_TOKEN, TOKEN_TYPE, EXPIRY_DATE } = process.env;
    if ((!ACCESS_TOKEN || !REFRESH_TOKEN || !TOKEN_TYPE || !EXPIRY_DATE)) { throw new Error('You need spot-sale-scheduler.json or environment variables'); }
    return {
      access_token: ACCESS_TOKEN,
      refresh_token: REFRESH_TOKEN,
      token_type: TOKEN_TYPE,
      expiry_date: EXPIRY_DATE
    };
  }
}

export class ClientSecretLoader {
  constructor(clientSecretPath = '../client-secret.json') {
    this.clientSecretPath = clientSecretPath;
  }

  async load() {
    let token;
    try {
      token = JSON.parse(await readFilePromise(this.clientSecretPath));
    } catch (err) {
      if (err.code !== 'ENOENT') { throw err; }
      if (!process.env.CLIENT_SECRET) { throw err; }
      token = JSON.parse(process.env.CLIENT_SECRET);
    }
    return token;
  }
}
