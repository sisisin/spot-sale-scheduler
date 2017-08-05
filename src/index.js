const { scrape } = require('./scraper');
const { register } = require('./register');

async function main() {
  const schedules = await scrape();
  register(schedules);
}

main().catch(err => console.log(err));
