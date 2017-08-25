import fs from 'fs';
import util from 'util';
const readFilePromise = util.promisify(fs.readFile);
import googleAuth from 'google-auth-library';

import clientSecretJson from '../client-secret.json';
import { TOKEN_PATH } from './constant';
import { GoogleClientFactory } from './google-client';
import { CredentialLoaderFactory } from './credential-loader';

export const CalendarClientFactory = {
  async create() {
    const clientSecret = clientSecretJson.installed.client_secret;
    const clientId = clientSecretJson.installed.client_id;
    const redirectUrl = clientSecretJson.installed.redirect_uris[0];
    const auth = new googleAuth();
    const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
    oauth2Client.credentials = await CredentialLoaderFactory.create().load();

    const googleClient = GoogleClientFactory.create();
    return new CalendarClient(googleClient, oauth2Client);
  }
};

export class CalendarClient {
  constructor(googleClient, auth) {
    this.googleClient = googleClient;
    this.auth = auth;
  }

  async register(schedules) {
    const promises = schedules.map(async ({ name, date }) => {
      const event = (await this.listEvents(date)).find(e => e.summary === name);
      if (event) { return Promise.resolve(); }
      return this.insertEvent(name, date);
    });
    return Promise.all(promises);
  }

  async insertEvent(name, targetDate) {
    const resource = {
      summary: name,
      start: {
        dateTime: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 10).toISOString(),
        timeZone: 'Asia/Tokyo'
      },
      end: {
        dateTime: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 11).toISOString(),
        timeZone: 'Asia/Tokyo'
      },

    };
    const config = {
      auth: this.auth,
      calendarId: 'primary',
      resource
    };

    return this.googleClient.insertEvent(config).then(res => res.items);
  }

  async listEvents(targetDate) {
    const nextDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);
    const config = {
      auth: this.auth,
      calendarId: 'primary',
      timeMax: nextDay.toISOString(),
      timeMin: targetDate.toISOString(),
      singleEvents: true
    };
    return this.googleClient.listEvents(config).then(res => res.items);
  }
}
