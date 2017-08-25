import { scrape } from './lib/scrape';
import { CalendarClientFactory } from './lib/calendar-client';

async function main() {
  const schedules = await scrape();
  const calendar = await CalendarClientFactory.create();
  await calendar.register(schedules);
}

main().catch(err => console.log(err));
