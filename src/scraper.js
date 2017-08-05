const axios = require('axios');
const cheerio = require('cheerio');

class EventScheduleScraper {
  get endpoint() {
    throw 'not implemented';
  }
  dateFinder() {
    throw 'not implemented';
  }
  async findSchedule() {
    const res = await axios.get(this.endpoint);
    console.log(res.data)
    return this.dateFinder(res.data);
  }
}

class Comitia extends EventScheduleScraper {
  get endpoint() { return 'https://www.comitia.co.jp/html/schedule.html'; }
  dateFinder(dom) {
    const findOneScheduleFromSection = (section) => {
      const name = section.find('h3').text();
      const [_, year, month, day] = section.find('table tr')
        .first()
        .find('td')
        .last()
        .text()
        .match(/(\d*)年(\d*)月(\d*)日/);
      return { name, date: new Date(year, month - 1, day) };
    };
    const $ = cheerio.load(dom);
    return Array.from($('section')).map(section => findOneScheduleFromSection(cheerio.load(section)('section')));
  }
}

async function scraper() {
  const comitia = await new Comitia().findSchedule();
  // console.log(comitia);
}

module.exports = { scraper, Comitia };
