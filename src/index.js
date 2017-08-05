const { scraper } = require('./scraper');
async function main() {
  scraper();
}

main().catch(err => console.log(err));
