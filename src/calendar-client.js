const { OAuth2ClientFactory } = require('./oauth2-client-factory');
const { GoogleClientFactory } = require('./google-client');

const CalendarClientFactory = {
  async create() {
    const auth = await OAuth2ClientFactory.create();
    const googleClient = GoogleClientFactory.create();
    return new CalendarClient(googleClient, auth);
  }
};

class CalendarClient {
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

module.exports = { CalendarClientFactory, CalendarClient };
