import google from 'googleapis';

export const GoogleClientFactory = {
  create() { return new GoogleClient(google, 'v3'); }
};

export class GoogleClient {
  constructor(google, apiVersion) {
    this.google = google;
    this.apiVersion = apiVersion;
  }

  async listEvents(config) {
    return new Promise((resolve, reject) => {
      this.google.calendar(this.apiVersion).events.list(config, (err, res) => {
        if (err) { return reject(err); }
        resolve(res);
      });
    });
  }

  async insertEvent(config) {
    return new Promise((resolve, reject) => {
      this.google.calendar(this.apiVersion).events.insert(config, (err, res) => {
        if (err) { return reject(err); }
        resolve(res);
      });
    });
  }
}
