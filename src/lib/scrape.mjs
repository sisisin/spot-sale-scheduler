import axios from 'axios';
import cheerio from 'cheerio';

class EventScheduleScraper {
  get endpoint() {
    throw 'not implemented';
  }
  dateFinder() {
    throw 'not implemented';
  }
  async findSchedule() {
    const res = await axios.get(this.endpoint);
    return this.dateFinder(res.data);
  }
}

export class Comitia extends EventScheduleScraper {
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

export class Comiket extends EventScheduleScraper {
  get endpoint() { return 'http://www.comiket.co.jp/info-a/index.html'; }
  dateFinder(dom) {
    const $ = cheerio.load(dom);
    const [name, term] = Array.from($('table').find('table table tr').slice(1).find('td'))
      .map(cElm => cheerio.load(cElm).text());

    const toHalfChar = s => String.fromCharCode(s.charCodeAt(0) - 65248);
    const [_, yearPart, month, startDate, endDate] = term
      .replace(/[０-９]/g, toHalfChar)
      .match(/(\d*)年(\d*)月(\d*)日.*?(\d*)日/)
      .map(str => Number(str));
    const year = 2000 + yearPart;

    return new Array(endDate - startDate + 1).fill(0).map((_, i) => {
      return { name, date: new Date(year, month - 1, startDate + i) };
    });
  }
}

export async function scrape() {
  const comitia = await new Comitia().findSchedule();
  const comiket = await new Comiket().findSchedule();
  return [...comitia, ...comiket];
}
