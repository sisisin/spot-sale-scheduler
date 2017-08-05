const { scrape } = require('./scrape');
const { CalendarClientFactory } = require('./calendar-client');

async function main() {
  const schedules = await scrape();
  const calendar = await CalendarClientFactory.create();
  await calendar.register(schedules);
}

main().catch(err => console.log(err));
