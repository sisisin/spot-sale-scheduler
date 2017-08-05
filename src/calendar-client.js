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
    const events = await this.listEvents(new Date());
    events.find(e => console.log(e.summary));
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

module.exports = { CalendarClientFactory };
